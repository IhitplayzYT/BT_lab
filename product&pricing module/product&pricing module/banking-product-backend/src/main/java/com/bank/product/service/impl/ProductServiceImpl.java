package com.bank.product.service.impl;

import com.bank.product.dto.*;
import com.bank.product.entity.*;
import com.bank.product.exception.DuplicateProductException;
import com.bank.product.exception.InvalidProductException;
import com.bank.product.exception.ProductInactiveException;
import com.bank.product.exception.ProductNotFoundException;
import com.bank.product.mapper.ProductMapper;
import com.bank.product.repository.ProductRepository;
import com.bank.product.repository.ProductSpecifications;
import com.bank.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private static final String STATUS_MESSAGE = "Status must be one of ACTIVE, INACTIVE, DRAFT, SUSPENDED, RETIRED";

    /** Fields of the Product entity that search may sort by; anything else is a 400 instead of a 500. */
    private static final Set<String> SORTABLE_FIELDS = Set.of(
            "productId", "productCode", "productName", "productType", "currency", "effectiveDate", "endDate",
            "status", "interestType", "minAge", "minDeposit", "maxDeposit", "minWithdrawal", "maxWithdrawal",
            "createdAt", "updatedAt");

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponseDTO createProduct(ProductRequestDTO dto) {
        log.info("Creating banking product with code: {}", dto.getProductCode());
        validateProductRequest(dto);

        productRepository.findByProductCode(dto.getProductCode())
                .ifPresent(p -> {
                    throw new DuplicateProductException("Product with code " + dto.getProductCode() + " already exists");
                });

        Product product = productMapper.toEntity(dto);
        Product savedProduct = productRepository.save(product);
        log.info("Successfully created product: {}", savedProduct.getProductCode());
        return productMapper.toResponseDTO(savedProduct);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponseDTO updateProduct(String productCode, ProductRequestDTO dto) {
        log.info("Updating banking product with code: {}", productCode);
        Product existingProduct = productRepository.findByProductCode(productCode)
                .orElseThrow(() -> new ProductNotFoundException("Product with code " + productCode + " not found"));

        validateProductUpdate(dto, existingProduct);

        if (dto.getProductName() != null && !dto.getProductName().trim().isEmpty()) {
            existingProduct.setProductName(dto.getProductName());
        }

        if (dto.getStatus() != null && !dto.getStatus().trim().isEmpty()) {
            try {
                ProductStatus newStatus = ProductStatus.valueOf(dto.getStatus().trim().toUpperCase());
                existingProduct.setStatus(newStatus);
            } catch (IllegalArgumentException e) {
                throw new InvalidProductException(STATUS_MESSAGE);
            }
        }

        if (dto.getRateLimit() != null) {
            existingProduct.setMinimumInterest(dto.getRateLimit().min());
            existingProduct.setMaximumInterest(dto.getRateLimit().max());
        }

        if (dto.getTermLimit() != null) {
            if (existingProduct.getBusinessRules() != null && !existingProduct.getBusinessRules().isEmpty()) {
                ProductBusinessRule rule = existingProduct.getBusinessRules().get(0);
                if (dto.getTermLimit().min() != null) rule.setTermLimitMin(dto.getTermLimit().min());
                if (dto.getTermLimit().max() != null) rule.setTermLimitMax(dto.getTermLimit().max());
            }
        }

        if (dto.getMinDeposit() != null) existingProduct.setMinDeposit(dto.getMinDeposit());
        if (dto.getMaxDeposit() != null) existingProduct.setMaxDeposit(dto.getMaxDeposit());
        if (dto.getMinWithdrawal() != null) existingProduct.setMinWithdrawal(dto.getMinWithdrawal());
        if (dto.getMaxWithdrawal() != null) existingProduct.setMaxWithdrawal(dto.getMaxWithdrawal());
        if (dto.getMinAge() != null) existingProduct.setMinAge(dto.getMinAge());
        if (dto.getEndDate() != null) existingProduct.setEndDate(dto.getEndDate());

        Product savedProduct = productRepository.save(existingProduct);
        log.info("Successfully updated product: {}", savedProduct.getProductCode());
        return productMapper.toResponseDTO(savedProduct);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponseDTO retireProduct(String productCode) {
        log.info("Retiring banking product with code: {}", productCode);
        Product product = productRepository.findByProductCode(productCode)
                .orElseThrow(() -> new ProductNotFoundException("Product with code " + productCode + " not found"));

        product.setStatus(ProductStatus.RETIRED);
        Product saved = productRepository.save(product);
        return productMapper.toResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> searchProducts(String productType, LocalDate startDate, LocalDate endDate) {
        return searchProducts(productType, startDate, endDate, null, 0, 50, "productId");
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> searchProducts(String productType, LocalDate startDate, LocalDate endDate,
                                                   String status, int page, int size, String sortBy) {
        if (status != null && !status.trim().isEmpty()) {
            try {
                ProductStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new InvalidProductException(STATUS_MESSAGE);
            }
        }
        String sortField = (sortBy == null || sortBy.isBlank()) ? "productId" : sortBy.trim();
        if (!SORTABLE_FIELDS.contains(sortField)) {
            throw new InvalidProductException("Cannot sort by '" + sortField + "'. Allowed: " + new TreeSet<>(SORTABLE_FIELDS));
        }
        Specification<Product> spec = ProductSpecifications.filterProducts(productType, startDate, endDate, status);
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(sortField).ascending());
        Page<Product> productPage = productRepository.findAll(spec, pageable);
        return productPage.getContent().stream()
                .map(productMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "#productCode")
    public ProductResponseDTO getProductByCode(String productCode) {
        Product product = productRepository.findByProductCode(productCode)
                .orElseThrow(() -> new ProductNotFoundException("Product with code " + productCode + " not found"));
        return productMapper.toResponseDTO(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductValidationResponseDTO validateProduct(String productCode, Integer termMonths, java.math.BigDecimal amount, Integer age) {
        log.info("Validating product {} for termMonths={}, amount={}, age={}", productCode, termMonths, amount, age);
        Product product = productRepository.findByProductCode(productCode)
                .orElseThrow(() -> new ProductNotFoundException("Product with code " + productCode + " not found"));

        // 1. Status Check: Must be ACTIVE
        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new ProductInactiveException("Product with code " + productCode + " is not ACTIVE (current status: " + product.getStatus() + ")");
        }

        // 2. Effective Date Check
        LocalDate today = LocalDate.now();
        if (product.getEffectiveDate() != null && today.isBefore(product.getEffectiveDate())) {
            throw new ProductInactiveException("Product " + productCode + " is not yet effective (effectiveDate: " + product.getEffectiveDate() + ")");
        }
        if (product.getEndDate() != null && today.isAfter(product.getEndDate())) {
            throw new ProductInactiveException("Product " + productCode + " expired on " + product.getEndDate());
        }

        // 3. Term Range Check
        Integer minTerm = null;
        Integer maxTerm = null;
        if (product.getBusinessRules() != null && !product.getBusinessRules().isEmpty()) {
            minTerm = product.getBusinessRules().get(0).getTermLimitMin();
            maxTerm = product.getBusinessRules().get(0).getTermLimitMax();
        }

        if (termMonths != null && minTerm != null && maxTerm != null) {
            if (termMonths < minTerm || termMonths > maxTerm) {
                throw new InvalidProductException("Requested term (" + termMonths + " months) is outside product allowed range [" + minTerm + ", " + maxTerm + "] months");
            }
        }

        // 4. Amount Range Check
        if (amount != null) {
            if (product.getMinDeposit() != null && amount.compareTo(product.getMinDeposit()) < 0) {
                throw new InvalidProductException("Deposit amount (" + amount + ") is below minimum allowed deposit of " + product.getMinDeposit());
            }
            if (product.getMaxDeposit() != null && amount.compareTo(product.getMaxDeposit()) > 0) {
                throw new InvalidProductException("Deposit amount (" + amount + ") exceeds maximum allowed deposit of " + product.getMaxDeposit());
            }
        }

        // 5. Age Requirement Check
        if (age != null && product.getMinAge() != null) {
            if (age < product.getMinAge()) {
                throw new InvalidProductException("Applicant age (" + age + ") is below the product minimum age requirement of " + product.getMinAge());
            }
        }

        return ProductValidationResponseDTO.builder()
                .valid(true)
                .productCode(product.getProductCode())
                .productName(product.getProductName())
                .status(product.getStatus().name())
                .message("Product configuration and criteria validated successfully for account creation")
                .effectiveDate(product.getEffectiveDate())
                .termMonths(termMonths)
                .amount(amount)
                .age(age)
                .minTerm(minTerm)
                .maxTerm(maxTerm)
                .minDeposit(product.getMinDeposit())
                .maxDeposit(product.getMaxDeposit())
                .minAge(product.getMinAge())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public RateCalculationResponseDTO calculateFinalRate(String productCode, RateCalculationRequestDTO request) {
        log.info("Calculating final rate for product: {}, request: {}", productCode, request);
        Product product = productRepository.findByProductCode(productCode)
                .orElseThrow(() -> new ProductNotFoundException("Product with code " + productCode + " not found"));

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new ProductInactiveException("Product with code " + productCode + " is not ACTIVE");
        }

        Integer minTerm = null;
        Integer maxTerm = null;
        java.math.BigDecimal minRate = product.getMinimumInterest() != null ? product.getMinimumInterest() : java.math.BigDecimal.valueOf(5.0);
        java.math.BigDecimal maxRate = product.getMaximumInterest() != null ? product.getMaximumInterest() : java.math.BigDecimal.valueOf(8.0);

        if (product.getBusinessRules() != null && !product.getBusinessRules().isEmpty()) {
            ProductBusinessRule rule = product.getBusinessRules().get(0);
            minTerm = rule.getTermLimitMin();
            maxTerm = rule.getTermLimitMax();
        }

        if (request.getTermMonths() != null && minTerm != null && maxTerm != null) {
            if (request.getTermMonths() < minTerm || request.getTermMonths() > maxTerm) {
                throw new InvalidProductException("Requested term (" + request.getTermMonths() + " months) is outside product allowed range [" + minTerm + ", " + maxTerm + "] months");
            }
        }

        java.math.BigDecimal baseRate = minRate;
        java.math.BigDecimal rateModifier = java.math.BigDecimal.ZERO;
        String category = request.getCustomerCategory() != null ? request.getCustomerCategory().trim().toUpperCase() : "GENERAL";

        // Auto-detect Senior Citizen by age if age >= 60 and category is GENERAL
        if (request.getAge() != null && request.getAge() >= 60 && "GENERAL".equals(category)) {
            category = "SENIOR_CITIZEN";
        }

        // Look up modifier in product's rate variations
        if (product.getRateVariations() != null && !product.getRateVariations().isEmpty()) {
            final String targetCat = category;
            rateModifier = product.getRateVariations().stream()
                    .filter(v -> v.getCustomerCategory() != null && v.getCustomerCategory().trim().equalsIgnoreCase(targetCat))
                    .map(RateVariation::getRateModifier)
                    .findFirst()
                    .orElse(java.math.BigDecimal.ZERO);
        } else {
            // Standard banking defaults
            if ("SENIOR_CITIZEN".equals(category)) {
                rateModifier = java.math.BigDecimal.valueOf(1.0);
            } else if ("EMPLOYEE".equals(category)) {
                rateModifier = java.math.BigDecimal.valueOf(0.5);
            } else if ("CORPORATE".equals(category)) {
                rateModifier = java.math.BigDecimal.valueOf(0.2);
            }
        }

        java.math.BigDecimal calculatedRate = baseRate.add(rateModifier);
        // Clamp within product rate limits
        java.math.BigDecimal finalRate = calculatedRate.min(maxRate).max(minRate);
        // Round to 2 decimal places
        finalRate = finalRate.setScale(2, java.math.RoundingMode.HALF_UP);

        return new RateCalculationResponseDTO(
                product.getProductCode(),
                product.getProductName(),
                request.getTermMonths(),
                category,
                baseRate,
                rateModifier,
                finalRate,
                minRate,
                maxRate
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getActiveProducts(String productType) {
        List<Product> products;
        if (productType != null && !productType.trim().isEmpty()) {
            products = productRepository.findByProductTypeIgnoreCaseAndStatus(productType.trim(), ProductStatus.ACTIVE);
        } else {
            products = productRepository.findByStatus(ProductStatus.ACTIVE);
        }

        return products.stream()
                .map(productMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "'defaults_' + #productCode")
    public ProductDefaultsResponseDTO getProductDefaults(String productCode) {
        Product product = productRepository.findByProductCode(productCode)
                .orElseThrow(() -> new ProductNotFoundException("Product with code " + productCode + " not found"));
        return productMapper.toDefaultsResponseDTO(product);
    }

    @Override
    @Transactional(readOnly = true)
    public CalculatorConfigDTO getCalculatorConfig(String productCode) {
        log.info("Fetching calculator config for product: {}", productCode);
        Product product = productRepository.findByProductCode(productCode)
                .orElseThrow(() -> new ProductNotFoundException("Product with code " + productCode + " not found"));

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new ProductInactiveException("Product with code " + productCode + " is not ACTIVE");
        }

        Integer minTerm = null;
        Integer maxTerm = null;
        java.math.BigDecimal minRate = product.getMinimumInterest() != null ? product.getMinimumInterest() : java.math.BigDecimal.valueOf(5.0);
        java.math.BigDecimal maxRate = product.getMaximumInterest() != null ? product.getMaximumInterest() : java.math.BigDecimal.valueOf(8.0);

        if (product.getBusinessRules() != null && !product.getBusinessRules().isEmpty()) {
            ProductBusinessRule rule = product.getBusinessRules().get(0);
            minTerm = rule.getTermLimitMin();
            maxTerm = rule.getTermLimitMax();
        }

        return CalculatorConfigDTO.builder()
                .productCode(product.getProductCode())
                .productName(product.getProductName())
                .productType(product.getProductType())
                .status(product.getStatus().name())
                .currency(product.getCurrency())
                .minPrincipal(product.getMinDeposit())
                .maxPrincipal(product.getMaxDeposit())
                .termLimit(CalculatorConfigDTO.TermLimit.builder()
                        .minMonths(minTerm != null ? minTerm : 0)
                        .maxMonths(maxTerm != null ? maxTerm : 120)
                        .build())
                .rateLimit(CalculatorConfigDTO.RateLimit.builder()
                        .minRate(minRate)
                        .maxRate(maxRate)
                        .build())
                .baseRate(minRate)
                .interestType(product.getInterestType())
                .supportsPeriodicPayout("FD".equalsIgnoreCase(product.getProductType()))
                .build();
    }

    @Override
    public BatchProductResponse batchCreateProducts(BatchProductRequest batchRequest) {
        String correlationId = batchRequest.getCorrelationId() != null ? batchRequest.getCorrelationId() : java.util.UUID.randomUUID().toString();
        log.info("Starting batch product creation with correlationId: {}, total products: {}", 
                correlationId, batchRequest.getProducts().size());

        List<ProductResponseDTO> results = new ArrayList<>();
        int successful = 0;
        int failed = 0;

        for (ProductRequestDTO request : batchRequest.getProducts()) {
            try {
                ProductResponseDTO response = createProduct(request);
                results.add(response);
                successful++;
            } catch (Exception e) {
                log.error("Failed to create product: {}", request.getProductCode(), e);
                failed++;
            }
        }

        // Send batch results to Kafka for logging
        // This would be implemented with a KafkaTemplate in a real scenario
        log.info("Batch product creation completed. CorrelationId: {}, Successful: {}, Failed: {}", 
                correlationId, successful, failed);

        return BatchProductResponse.builder()
                .correlationId(correlationId)
                .totalProducts(batchRequest.getProducts().size())
                .successfulProducts(successful)
                .failedProducts(failed)
                .results(results)
                .status(failed == 0 ? "COMPLETED" : "PARTIALLY_COMPLETED")
                .message(failed == 0 ? "All products created successfully" 
                        : "Batch completed with " + failed + " failures")
                .build();
    }

    private void validateProductRequest(ProductRequestDTO dto) {
        if (dto.getCurrency() == null || dto.getCurrency().trim().isEmpty()) {
            throw new InvalidProductException("Currency is mandatory");
        }

        // ... (rest of the code remains the same)
        if (dto.getStatus() == null || dto.getStatus().trim().isEmpty()) {
            throw new InvalidProductException("Status is mandatory");
        }

        try {
            ProductStatus.valueOf(dto.getStatus().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidProductException(STATUS_MESSAGE);
        }

        if (dto.getTermLimit() != null) {
            Integer min = dto.getTermLimit().min();
            Integer max = dto.getTermLimit().max();
            if (min != null && min <= 0) {
                throw new InvalidProductException("Minimum term must be positive");
            }
            if (max != null && max <= 0) {
                throw new InvalidProductException("Maximum term must be positive");
            }
            if (min != null && max != null && min > max) {
                throw new InvalidProductException("Minimum term cannot be greater than maximum term");
            }
        }

        if (dto.getRateLimit() != null) {
            java.math.BigDecimal min = dto.getRateLimit().min();
            java.math.BigDecimal max = dto.getRateLimit().max();
            if (min != null && min.compareTo(java.math.BigDecimal.ZERO) < 0) {
                throw new InvalidProductException("Minimum interest cannot be negative");
            }
            if (max != null && max.compareTo(java.math.BigDecimal.ZERO) < 0) {
                throw new InvalidProductException("Maximum interest cannot be negative");
            }
            if (min != null && max != null && min.compareTo(max) > 0) {
                throw new InvalidProductException("Minimum interest cannot be greater than maximum interest");
            }
        }

        if (dto.getMinDeposit() != null && dto.getMaxDeposit() != null && dto.getMinDeposit().compareTo(dto.getMaxDeposit()) > 0) {
            throw new InvalidProductException("Minimum deposit amount cannot be greater than maximum deposit amount");
        }

        if (dto.getMinWithdrawal() != null && dto.getMaxWithdrawal() != null && dto.getMinWithdrawal().compareTo(dto.getMaxWithdrawal()) > 0) {
            throw new InvalidProductException("Minimum withdrawal amount cannot be greater than maximum withdrawal amount");
        }

        if (dto.getEffectiveDate() != null && dto.getEndDate() != null && dto.getEffectiveDate().isAfter(dto.getEndDate())) {
            throw new InvalidProductException("Effective date cannot be after end date");
        }

        if (dto.getInterestType() != null && !dto.getInterestType().trim().isEmpty()) {
            String type = dto.getInterestType().trim().toUpperCase();
            if ("LOAN".equalsIgnoreCase(dto.getProductType()) && "CREDIT".equals(type)) {
                throw new InvalidProductException("Interest type must be DEBIT for loans");
            }
            if (!"LOAN".equalsIgnoreCase(dto.getProductType()) && "DEBIT".equals(type)) {
                throw new InvalidProductException("Interest type must be CREDIT for deposits");
            }
        }
    }

    private void validateProductUpdate(ProductRequestDTO dto, Product existingProduct) {
        if (dto.getTermLimit() != null) {
            Integer min = dto.getTermLimit().min();
            Integer max = dto.getTermLimit().max();
            if (min != null && min <= 0) {
                throw new InvalidProductException("Minimum term must be positive");
            }
            if (max != null && max <= 0) {
                throw new InvalidProductException("Maximum term must be positive");
            }
            if (min != null && max != null && min > max) {
                throw new InvalidProductException("Minimum term cannot be greater than maximum term");
            }
        }
        if (dto.getRateLimit() != null) {
            java.math.BigDecimal newMin = dto.getRateLimit().min();
            java.math.BigDecimal newMax = dto.getRateLimit().max();
            java.math.BigDecimal finalMin = newMin != null ? newMin : existingProduct.getMinimumInterest();
            java.math.BigDecimal finalMax = newMax != null ? newMax : existingProduct.getMaximumInterest();
            if (finalMin != null && finalMin.compareTo(java.math.BigDecimal.ZERO) < 0) {
                throw new InvalidProductException("Minimum interest cannot be negative");
            }
            if (finalMax != null && finalMax.compareTo(java.math.BigDecimal.ZERO) < 0) {
                throw new InvalidProductException("Maximum interest cannot be negative");
            }
            if (finalMin != null && finalMax != null && finalMin.compareTo(finalMax) > 0) {
                throw new InvalidProductException("Minimum interest cannot be greater than maximum interest");
            }
        }
        // Compare against the stored value when only one side of a pair is sent.
        java.math.BigDecimal minDep = dto.getMinDeposit() != null ? dto.getMinDeposit() : existingProduct.getMinDeposit();
        java.math.BigDecimal maxDep = dto.getMaxDeposit() != null ? dto.getMaxDeposit() : existingProduct.getMaxDeposit();
        if (minDep != null && maxDep != null && minDep.compareTo(maxDep) > 0) {
            throw new InvalidProductException("Minimum deposit amount cannot be greater than maximum deposit amount");
        }
        java.math.BigDecimal minWd = dto.getMinWithdrawal() != null ? dto.getMinWithdrawal() : existingProduct.getMinWithdrawal();
        java.math.BigDecimal maxWd = dto.getMaxWithdrawal() != null ? dto.getMaxWithdrawal() : existingProduct.getMaxWithdrawal();
        if (minWd != null && maxWd != null && minWd.compareTo(maxWd) > 0) {
            throw new InvalidProductException("Minimum withdrawal amount cannot be greater than maximum withdrawal amount");
        }
        if (dto.getEndDate() != null && existingProduct.getEffectiveDate() != null
                && dto.getEndDate().isBefore(existingProduct.getEffectiveDate())) {
            throw new InvalidProductException("End date cannot be before effective date");
        }
    }
}
