package com.bank.calculator.service.impl;

import com.bank.calculator.client.CustomerClient;
import com.bank.calculator.client.ProductClient;
import com.bank.calculator.client.dto.CustomerCategoriesDto;
import com.bank.calculator.client.dto.ProductConfigDto;
import com.bank.calculator.dto.BatchCalculationRequest;
import com.bank.calculator.dto.BatchCalculationResponse;
import com.bank.calculator.dto.request.CalculationRequest;
import com.bank.calculator.dto.request.ComparisonRequest;
import com.bank.calculator.dto.request.CustomCalculationRequest;
import com.bank.calculator.dto.request.TermDto;
import com.bank.calculator.dto.response.CalculationResponse;
import com.bank.calculator.dto.response.ComparisonResponse;
import com.bank.calculator.dto.response.ProductPreviewResponse;
import com.bank.calculator.exception.InactiveProductException;
import com.bank.calculator.exception.InvalidPrincipalException;
import com.bank.calculator.exception.InvalidTermException;
import com.bank.calculator.exception.ProductNotFoundException;
import com.bank.calculator.exception.ServiceUnavailableException;
import com.bank.calculator.exception.UnsupportedPayoutModeException;
import com.bank.calculator.exception.CalculationNotFoundException;
import com.bank.calculator.model.CalculationAudit;
import com.bank.calculator.model.enums.CompoundingFrequency;
import com.bank.calculator.model.enums.InterestType;
import com.bank.calculator.model.enums.PayoutMode;
import com.bank.calculator.model.enums.TermUnit;
import com.bank.calculator.repository.CalculationAuditRepository;
import com.bank.calculator.service.*;
import com.bank.calculator.util.CalculationIdGenerator;
import com.bank.calculator.util.CorrelationIdFilter;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * Primary orchestrator for FD calculation operations.
 *
 * <p>Execution flow for a single calculation:
 * <ol>
 *   <li>Extract authenticated username from the JWT (never from request body).</li>
 *   <li>Fetch cached product configuration from {@link ProductCatalogService}.</li>
 *   <li>Validate product status, principal range, term range, and payout mode.</li>
 *   <li>Fetch authoritative customer categories from Customer Service.</li>
 *   <li>Apply category bonuses (via {@link CategoryBonusService}).</li>
 *   <li>Compute maturity, APY, and periodic payouts via {@link CalculationEngine}.</li>
 *   <li>Generate unique human-readable calculationId and persistent UUID.</li>
 *   <li>Build and return response.</li>
 *   <li>Persist audit asynchronously via {@link AuditService}.</li>
 * </ol>
 */
@Service
public class FdCalculatorServiceImpl implements FdCalculatorService {

    private static final Logger log = LoggerFactory.getLogger(FdCalculatorServiceImpl.class);
    private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;
    private static final BigDecimal TWELVE = new BigDecimal("12");

    private final ProductClient productClient;
    private final ProductCatalogService productCatalogService;
    private final CustomerClient customerClient;
    private final CalculationEngine calculationEngine;
    private final CategoryBonusService categoryBonusService;
    private final ExplainService explainService;
    private final AuditService auditService;
    private final ExportService exportService;
    private final CalculationAuditRepository auditRepository;
    private final CalculationIdGenerator idGenerator;

    /**
     * Primary constructor autowired by Spring Boot with cached product catalog service.
     */
    @org.springframework.beans.factory.annotation.Autowired
    public FdCalculatorServiceImpl(
            ProductCatalogService productCatalogService,
            CustomerClient customerClient,
            CalculationEngine calculationEngine,
            CategoryBonusService categoryBonusService,
            ExplainService explainService,
            AuditService auditService,
            ExportService exportService,
            CalculationAuditRepository auditRepository,
            CalculationIdGenerator idGenerator) {
        this.productCatalogService = productCatalogService;
        this.productClient = null;
        this.customerClient = customerClient;
        this.calculationEngine = calculationEngine;
        this.categoryBonusService = categoryBonusService;
        this.explainService = explainService;
        this.auditService = auditService;
        this.exportService = exportService;
        this.auditRepository = auditRepository;
        this.idGenerator = idGenerator;
        System.out.println("FdCalculatorServiceImpl: Constructor called with ProductCatalogService=" + productCatalogService.getClass().getName());
    }

    /**
     * Overloaded constructor for unit tests passing {@link ProductClient} directly.
     */
    public FdCalculatorServiceImpl(
            ProductClient productClient,
            CustomerClient customerClient,
            CalculationEngine calculationEngine,
            CategoryBonusService categoryBonusService,
            ExplainService explainService,
            AuditService auditService,
            ExportService exportService,
            CalculationAuditRepository auditRepository,
            CalculationIdGenerator idGenerator) {
        this.productClient = productClient;
        this.productCatalogService = productClient != null ? new ProductCatalogService(productClient) : null;
        this.customerClient = customerClient;
        this.calculationEngine = calculationEngine;
        this.categoryBonusService = categoryBonusService;
        this.explainService = explainService;
        this.auditService = auditService;
        this.exportService = exportService;
        this.auditRepository = auditRepository;
        this.idGenerator = idGenerator;
    }

    @Override
    public CalculationResponse calculate(CalculationRequest request, Authentication authentication) {
        return calculateInternal(request, authentication, true);
    }

    private CalculationResponse calculateInternal(CalculationRequest request, Authentication authentication, boolean persistAudit) {
        String username = extractUsername(authentication);
        String correlationId = MDC.get(CorrelationIdFilter.MDC_KEY);

        log.info("[{}] Calculation request from user='{}' product='{}' principal='{}' persistAudit={}",
                correlationId, username, request.productCode(), request.principal(), persistAudit);

        // 1. Fetch product config (cached)
        ProductConfigDto product = fetchProduct(request.productCode());

        // 2. Validate
        validateProduct(product, request);

        // 3. Fetch customer categories (authoritative source — not from request)
        List<String> categories = fetchCategories(username);

        // 4. Apply category bonuses
        CategoryBonusService.BonusResult bonus = product.getCategoryBonuses() != null
                ? categoryBonusService.computeProductBonus(categories, product.getBaseRate(), product.getRateLimit().getMaxRate(), product.getCategoryBonuses())
                : categoryBonusService.computeBonus(
                categories,
                product.getBaseRate(),
                product.getRateLimit().getMaxRate());

        // 5. Compute term in years
        int termMonths = toMonths(request.term());
        BigDecimal termYears = BigDecimal.valueOf(termMonths).divide(TWELVE, 12, ROUNDING);

        // 6. Calculate maturity & APY
        InterestType interestType = parseInterestType(product.getInterestType());
        CompoundingFrequency frequency = interestType == InterestType.COMPOUND
                ? parseFrequency(product.getCompoundingFrequency())
                : CompoundingFrequency.YEARLY;

        CalculationEngine.CalculationResult calcResult;
        if (request.resolvedPayoutMode() == PayoutMode.PERIODIC) {
            calcResult = calculationEngine.calculatePeriodic(
                    request.principal(), bonus.effectiveRate(), termYears, frequency);
        } else if (interestType == InterestType.SIMPLE) {
            calcResult = calculationEngine.calculateSimple(
                    request.principal(), bonus.effectiveRate(), termYears);
        } else {
            calcResult = calculationEngine.calculateCompound(
                    request.principal(), bonus.effectiveRate(), termYears, frequency);
        }

        BigDecimal apy = calculationEngine.calculateApy(bonus.effectiveRate(), frequency);

        // 7. Identifiers and Dates
        String calculationId = idGenerator.next();
        String uuid = UUID.randomUUID().toString();
        LocalDate startDate = request.resolvedStartDate();
        LocalDate maturityDate = startDate.plusMonths(termMonths);

        CalculationResponse response = new CalculationResponse(
                calculationId,
                uuid,
                product.getProductCode(),
                product.getProductName(),
                request.principal().setScale(2, ROUNDING),
                request.term(),
                request.resolvedPayoutMode(),
                startDate,
                maturityDate,
                interestType,
                frequency,
                product.getBaseRate().setScale(2, ROUNDING),
                bonus.categoryBenefits(),
                bonus.requestedTotalBonus(),
                bonus.appliedTotalBonus(),
                bonus.bonusCap(),
                bonus.effectiveRate(),
                apy,
                bonus.rateCapped(),
                calcResult.interestEarned(),
                calcResult.maturityAmount(),
                calcResult.periodicPayoutAmount(),
                product.getCurrency(),
                null, // explanation set after
                Instant.now()
        );

        // Build explanation inline
        String explanation = explainService.explain(response);
        response = new CalculationResponse(
                response.calculationId(), response.uuid(), response.productCode(), response.productName(),
                response.principal(), response.term(), response.payoutMode(), response.startDate(),
                response.estimatedMaturityDate(), response.interestType(), response.compoundingFrequency(),
                response.baseRate(), response.categoryBenefits(), response.requestedTotalBonus(),
                response.appliedTotalBonus(), response.bonusCap(), response.effectiveRate(), response.apy(),
                response.rateCapped(), response.interestEarned(), response.maturityAmount(),
                response.periodicPayoutAmount(), response.currency(), explanation, response.generatedAt()
        );

        // 8. Persist audit asynchronously only for single calculation requests (non-blocking)
        if (persistAudit) {
            CalculationAudit audit = buildAudit(response, username, product, termMonths);
            auditService.saveAsync(audit, correlationId);
        }

        log.info("[{}] Calculation complete: calculationId='{}' uuid='{}' maturity='{}'",
                correlationId, calculationId, uuid, calcResult.maturityAmount());

        return response;
    }

    @Override
    public CalculationResponse getCalculation(String calculationId, Authentication authentication) {
        String username = extractUsername(authentication);

        CalculationAudit audit = auditRepository
                .findByCalculationIdAndCustomerId(calculationId, username)
                .or(() -> auditService.findRecentByCalculationIdAndCustomerId(calculationId, username))
                .orElseThrow(() -> new CalculationNotFoundException(calculationId));

        return auditToResponse(audit);
    }

    @Override
    public CalculationResponse getCalculationByUuid(String uuid, Authentication authentication) {
        String username = extractUsername(authentication);

        CalculationAudit audit = auditRepository
                .findByUuidAndCustomerId(uuid, username)
                .or(() -> auditService.findRecentByUuidAndCustomerId(uuid, username))
                .orElseThrow(() -> new CalculationNotFoundException(uuid));

        return auditToResponse(audit);
    }

    @Override
    public ComparisonResponse compare(ComparisonRequest request, Authentication authentication) {
        List<CalculationResponse> results = request.options().stream()
                .map(option -> {
                    CalculationRequest calcReq = new CalculationRequest(
                            request.principal(), option.term(), option.productCode(), PayoutMode.CUMULATIVE, null);
                    return calculateInternal(calcReq, authentication, false);
                })
                .sorted(Comparator.comparing(CalculationResponse::maturityAmount).reversed())
                .toList();

        return new ComparisonResponse(results);
    }

    @Override
    public ProductPreviewResponse previewProduct(String productCode) {
        ProductConfigDto product = fetchProduct(productCode);
        if (!"ACTIVE".equalsIgnoreCase(product.getStatus())) {
            throw new InactiveProductException(productCode);
        }
        return new ProductPreviewResponse(
                product.getProductCode(),
                product.getProductName(),
                product.getCurrency(),
                product.getMinPrincipal(),
                product.getMaxPrincipal(),
                product.getTermLimit().getMinMonths(),
                product.getTermLimit().getMaxMonths(),
                product.getBaseRate(),
                product.getRateLimit().getMaxRate(),
                parseInterestType(product.getInterestType()),
                parseFrequency(product.getCompoundingFrequency()),
                product.isSupportsPeriodicPayout()
        );
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private ProductConfigDto fetchProduct(String productCode) {
        if (productCatalogService != null) {
            return productCatalogService.getProductConfig(productCode);
        }
        try {
            ProductConfigDto dto = productClient != null ? productClient.getCalculatorConfig(productCode) : null;
            if (dto == null) {
                throw new ProductNotFoundException(productCode);
            }
            return dto;
        } catch (ProductNotFoundException e) {
            throw e;
        } catch (FeignException.NotFound e) {
            throw new ProductNotFoundException(productCode);
        } catch (FeignException e) {
            throw new ServiceUnavailableException("Product Service", e);
        } catch (Exception e) {
            throw new ServiceUnavailableException("Product Service", e);
        }
    }

    private List<String> fetchCategories(String username) {
        try {
            CustomerCategoriesDto dto = customerClient.getCustomerCategories(username);
            if (dto == null || dto.getCategories() == null) {
                return List.of();
            }
            return dto.getCategories();
        } catch (FeignException e) {
            throw new ServiceUnavailableException("Customer Service", e);
        } catch (Exception e) {
            throw new ServiceUnavailableException("Customer Service", e);
        }
    }

    private void validateProduct(ProductConfigDto product, CalculationRequest request) {
        if (!"ACTIVE".equalsIgnoreCase(product.getStatus())) {
            throw new InactiveProductException(product.getProductCode());
        }

        // Principal range
        if (request.principal().compareTo(product.getMinPrincipal()) < 0
                || request.principal().compareTo(product.getMaxPrincipal()) > 0) {
            throw new InvalidPrincipalException(
                    String.format("Principal must be between %s and %s for product %s.",
                            product.getMinPrincipal(), product.getMaxPrincipal(),
                            product.getProductCode()));
        }

        // Term range
        int termMonths = toMonths(request.term());
        int min = product.getTermLimit().getMinMonths();
        int max = product.getTermLimit().getMaxMonths();
        if (termMonths < min || termMonths > max) {
            throw new InvalidTermException(
                    String.format("Term must be between %d and %d months for product %s.",
                            min, max, product.getProductCode()));
        }

        // Payout mode & periodic tenure divisibility
        if (request.resolvedPayoutMode() == PayoutMode.PERIODIC) {
            if (!product.isSupportsPeriodicPayout()) {
                throw new UnsupportedPayoutModeException(product.getProductCode());
            }
            CompoundingFrequency freq = parseFrequency(product.getCompoundingFrequency());
            int periodMonths = 12 / freq.getPeriodsPerYear();
            if (termMonths % periodMonths != 0) {
                throw new InvalidTermException(
                        String.format("Term of %d months is not a multiple of the %s payout frequency (%d months).",
                                termMonths, freq.name(), periodMonths));
            }
        }
    }

    private int toMonths(TermDto term) {
        return term.unit() == TermUnit.YEARS ? term.value() * 12 : term.value();
    }

    private String extractUsername(Authentication authentication) {
        if (authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt.getSubject();
        }
        return authentication.getName();
    }

    private InterestType parseInterestType(String raw) {
        try {
            return InterestType.valueOf(raw.toUpperCase());
        } catch (Exception e) {
            throw new com.bank.calculator.exception.FdCalculatorException(
                    "INVALID_PRODUCT_CONFIG",
                    "Product has invalid interest type: " + raw) {};
        }
    }

    private CompoundingFrequency parseFrequency(String raw) {
        if (raw == null) return CompoundingFrequency.MONTHLY;
        try {
            return CompoundingFrequency.valueOf(raw.toUpperCase());
        } catch (Exception e) {
            return CompoundingFrequency.MONTHLY;
        }
    }

    private CalculationAudit buildAudit(CalculationResponse resp, String username,
                                        ProductConfigDto product, int termMonths) {
        return CalculationAudit.builder()
                .calculationId(resp.calculationId())
                .uuid(resp.uuid())
                .customerId(username)
                .productCode(resp.productCode())
                .principal(resp.principal())
                .termMonths(termMonths)
                .baseRate(resp.baseRate())
                .effectiveRate(resp.effectiveRate())
                .interestType(resp.interestType().name())
                .interestEarned(resp.interestEarned())
                .maturityAmount(resp.maturityAmount())
                .estimatedMaturityDate(resp.estimatedMaturityDate())
                .createdAt(resp.generatedAt())
                .build();
    }

    private CalculationResponse auditToResponse(CalculationAudit audit) {
        InterestType interestType;
        try {
            interestType = InterestType.valueOf(audit.getInterestType());
        } catch (Exception e) {
            interestType = InterestType.COMPOUND;
        }

        return new CalculationResponse(
                audit.getCalculationId(),
                audit.getUuid(),
                audit.getProductCode(),
                null,
                audit.getPrincipal(),
                new TermDto(audit.getTermMonths(), TermUnit.MONTHS),
                PayoutMode.CUMULATIVE,
                null,
                audit.getEstimatedMaturityDate(),
                interestType,
                null,
                audit.getBaseRate(),
                List.of(),
                null, null, null,
                audit.getEffectiveRate(),
                null,
                false,
                audit.getInterestEarned(),
                audit.getMaturityAmount(),
                null,
                "INR",
                null,
                audit.getCreatedAt()
        );
    }

    @Override
    public BatchCalculationResponse batchCalculate(BatchCalculationRequest batchRequest, Authentication authentication) {
        String correlationId = batchRequest.correlationId() != null ? batchRequest.correlationId() : UUID.randomUUID().toString();
        MDC.put("correlationId", correlationId);
        
        log.info("Starting batch calculation with correlationId: {}, total calculations: {}", 
                correlationId, batchRequest.calculations().size());

        List<CalculationResponse> results = new ArrayList<>();
        int successful = 0;
        int failed = 0;

        for (CalculationRequest request : batchRequest.calculations()) {
            try {
                CalculationResponse response = calculate(request, authentication);
                results.add(response);
                successful++;
            } catch (Exception e) {
                log.error("Failed to calculate for request: {}", request, e);
                failed++;
            }
        }

        // Send batch results to Kafka for logging
        // This would be implemented with a KafkaTemplate in a real scenario
        log.info("Batch calculation completed. CorrelationId: {}, Successful: {}, Failed: {}", 
                correlationId, successful, failed);

        return new BatchCalculationResponse(
                correlationId,
                batchRequest.calculations().size(),
                successful,
                failed,
                results,
                failed == 0 ? "COMPLETED" : "PARTIALLY_COMPLETED",
                failed == 0 ? "All calculations completed successfully" 
                        : "Batch completed with " + failed + " failures"
        );
    }

    @Override
    public CalculationResponse calculateCustom(CustomCalculationRequest request, Authentication authentication) {
        String username = extractUsername(authentication);
        String correlationId = MDC.get(CorrelationIdFilter.MDC_KEY);

        log.info("[{}] Custom calculation request from user='{}' principal='{}' rate='{}' interestType='{}'",
                correlationId, username, request.principal(), request.interestRate(), request.interestType());

        // Compute term in years
        int termMonths = toMonths(request.term());
        BigDecimal termYears = BigDecimal.valueOf(termMonths).divide(TWELVE, 12, ROUNDING);

        // Use provided parameters directly
        InterestType interestType = request.interestType();
        CompoundingFrequency frequency = interestType == InterestType.COMPOUND
                ? request.resolvedCompoundingFrequency()
                : CompoundingFrequency.YEARLY;

        // Calculate maturity & APY
        CalculationEngine.CalculationResult calcResult;
        if (request.resolvedPayoutMode() == PayoutMode.PERIODIC) {
            calcResult = calculationEngine.calculatePeriodic(
                    request.principal(), request.interestRate(), termYears, frequency);
        } else if (interestType == InterestType.SIMPLE || interestType == InterestType.CREDIT) {
            calcResult = calculationEngine.calculateSimple(
                    request.principal(), request.interestRate(), termYears);
        } else {
            calcResult = calculationEngine.calculateCompound(
                    request.principal(), request.interestRate(), termYears, frequency);
        }

        BigDecimal apy = calculationEngine.calculateApy(request.interestRate(), frequency);

        // Identifiers and Dates
        String calculationId = idGenerator.next();
        String uuid = UUID.randomUUID().toString();
        LocalDate startDate = request.resolvedStartDate();
        LocalDate maturityDate = startDate.plusMonths(termMonths);

        CalculationResponse response = new CalculationResponse(
                calculationId,
                uuid,
                "CUSTOM",
                "Custom FD",
                request.principal().setScale(2, ROUNDING),
                request.term(),
                request.resolvedPayoutMode(),
                startDate,
                maturityDate,
                interestType,
                frequency,
                request.interestRate().setScale(2, ROUNDING),
                List.of(), // No category benefits for custom FDs
                null, null, null,
                request.interestRate(), // No bonus applied
                apy,
                false,
                calcResult.interestEarned(),
                calcResult.maturityAmount(),
                calcResult.periodicPayoutAmount(),
                "INR",
                null, // explanation set after
                Instant.now()
        );

        // Build explanation inline
        String explanation = explainService.explain(response);
        response = new CalculationResponse(
                response.calculationId(), response.uuid(), response.productCode(), response.productName(),
                response.principal(), response.term(), response.payoutMode(), response.startDate(),
                response.estimatedMaturityDate(), response.interestType(), response.compoundingFrequency(),
                response.baseRate(), response.categoryBenefits(), response.requestedTotalBonus(),
                response.appliedTotalBonus(), response.bonusCap(), response.effectiveRate(), response.apy(),
                response.rateCapped(), response.interestEarned(), response.maturityAmount(),
                response.periodicPayoutAmount(), response.currency(), explanation, response.generatedAt()
        );

        log.info("[{}] Custom calculation complete: calculationId='{}' uuid='{}' maturity='{}'",
                correlationId, calculationId, uuid, calcResult.maturityAmount());

        return response;
    }
}
