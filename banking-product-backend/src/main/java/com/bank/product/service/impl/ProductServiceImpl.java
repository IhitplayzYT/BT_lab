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
import com.bank.product.service.ProductChargeDefaults;
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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

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
        ProductChargeDefaults.ensureFdTransactionFee(product);
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

        ProductResponseDTO previous = productMapper.toResponseDTO(existingProduct);
        if (dto.getEffectiveDate() == null) dto.setEffectiveDate(previous.getEffectiveDate());
        if (dto.getEndDate() == null) dto.setEndDate(previous.getEndDate());
        if (dto.getTermLimit() == null) dto.setTermLimit(previous.getTermLimit());
        if (dto.getRateLimit() == null) dto.setRateLimit(previous.getRateLimit());
        if (dto.getInterestType() == null) dto.setInterestType(previous.getInterestType());
        if (dto.getMinAge() == null) dto.setMinAge(previous.getMinAge());
        if (dto.getMinDeposit() == null) dto.setMinDeposit(previous.getMinDeposit());
        if (dto.getMaxDeposit() == null) dto.setMaxDeposit(previous.getMaxDeposit());
        if (dto.getMinWithdrawal() == null) dto.setMinWithdrawal(previous.getMinWithdrawal());
        if (dto.getMaxWithdrawal() == null) dto.setMaxWithdrawal(previous.getMaxWithdrawal());
        if (dto.getAllowedTransactionTypes() == null) dto.setAllowedTransactionTypes(previous.getAllowedTransactionTypes());
        if (dto.getBalanceTypes() == null) dto.setBalanceTypes(previous.getBalanceTypes());
        if (dto.getCharges() == null) dto.setCharges(previous.getCharges());
        if (dto.getChargeDetails() == null) dto.setChargeDetails(previous.getChargeDetails());
        if (dto.getTaxRate() == null) dto.setTaxRate(previous.getTaxRate());
        if (dto.getServiceFeeRate() == null) dto.setServiceFeeRate(previous.getServiceFeeRate());
        if (dto.getServiceFeeFlat() == null) dto.setServiceFeeFlat(previous.getServiceFeeFlat());
        if (dto.getDocumentationFee() == null) dto.setDocumentationFee(previous.getDocumentationFee());
        if (dto.getGstRate() == null) dto.setGstRate(previous.getGstRate());
        if (dto.getPrematurePenaltyRate() == null) dto.setPrematurePenaltyRate(previous.getPrematurePenaltyRate());
        if (dto.getCompoundingFrequency() == null) dto.setCompoundingFrequency(previous.getCompoundingFrequency());
        if (dto.getAllowedRoles() == null) dto.setAllowedRoles(previous.getAllowedRoles());
        if (dto.getRateVariations() == null) dto.setRateVariations(previous.getRateVariations());
        validateProductUpdate(dto, existingProduct);

        validateProductRequest(dto);
        if (!productCode.equals(dto.getProductCode())) {
            throw new InvalidProductException("Product code cannot be changed");
        }
        Product updated = productMapper.toEntity(dto);
        existingProduct.setProductName(updated.getProductName());
        existingProduct.setProductType(updated.getProductType());
        existingProduct.setCurrency(updated.getCurrency());
        existingProduct.setStatus(updated.getStatus());
        existingProduct.setEffectiveDate(updated.getEffectiveDate());
        existingProduct.setEndDate(updated.getEndDate());
        existingProduct.setInterestType(updated.getInterestType());
        existingProduct.setTaxRate(updated.getTaxRate());
        existingProduct.setServiceFeeRate(updated.getServiceFeeRate());
        existingProduct.setServiceFeeFlat(updated.getServiceFeeFlat());
        existingProduct.setDocumentationFee(updated.getDocumentationFee());
        existingProduct.setGstRate(updated.getGstRate());
        existingProduct.setPrematurePenaltyRate(updated.getPrematurePenaltyRate());
        existingProduct.setCompoundingFrequency(updated.getCompoundingFrequency());
        existingProduct.setMinAge(updated.getMinAge());
        existingProduct.setMinDeposit(updated.getMinDeposit());
        existingProduct.setMaxDeposit(updated.getMaxDeposit());
        existingProduct.setMinWithdrawal(updated.getMinWithdrawal());
        existingProduct.setMaxWithdrawal(updated.getMaxWithdrawal());
        existingProduct.setAllowedTransactionTypes(updated.getAllowedTransactionTypes());
        existingProduct.setBalanceTypes(updated.getBalanceTypes());
        existingProduct.getBusinessRules().clear();
        existingProduct.getBusinessRules().addAll(updated.getBusinessRules());
        existingProduct.getCharges().clear();
        existingProduct.getCharges().addAll(updated.getCharges());
        existingProduct.getAllowedRoles().clear();
        existingProduct.getAllowedRoles().addAll(updated.getAllowedRoles());
        existingProduct.getRateVariations().clear();
        existingProduct.getRateVariations().addAll(updated.getRateVariations());

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
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void permanentlyDeleteProduct(String productCode) {
        log.info("Permanently deleting banking product with code: {}", productCode);
        Product product = productRepository.findByProductCode(productCode)
                .orElseThrow(() -> new ProductNotFoundException("Product with code " + productCode + " not found"));

        productRepository.delete(product);
        log.info("Successfully permanently deleted product: {}", productCode);
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
        if (page < 0 || size < 1 || size > 200 || !java.util.Set.of("productId", "productCode", "productName", "productType", "effectiveDate", "status").contains(sortBy)) {
            throw new InvalidProductException("Invalid pagination or sort field");
        }
        Specification<Product> spec = ProductSpecifications.filterProducts(productType, startDate, endDate, status);
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(sortBy != null ? sortBy : "productId").ascending());
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
    public ProductValidationResponseDTO validateProduct(String productCode, Integer termMonths, Double amount, Integer age) {
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
            if (!Double.isFinite(amount) || amount <= 0) throw new InvalidProductException("Amount must be positive and finite");
            if (product.getMinDeposit() != null && amount < product.getMinDeposit()) {
                throw new InvalidProductException("Deposit amount (" + amount + ") is below minimum allowed deposit of " + product.getMinDeposit());
            }
            if (product.getMaxDeposit() != null && amount > product.getMaxDeposit()) {
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
        validateProduct(productCode, request.getTermMonths(), request.getAmount(), request.getAge());
        log.info("Calculating final rate for product: {}, request: {}", productCode, request);
        Product product = productRepository.findByProductCode(productCode)
                .orElseThrow(() -> new ProductNotFoundException("Product with code " + productCode + " not found"));

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new ProductInactiveException("Product with code " + productCode + " is not ACTIVE");
        }

        Integer minTerm = null;
        Integer maxTerm = null;
        Double minRate = null;
        Double maxRate = null;

        if (product.getBusinessRules() != null && !product.getBusinessRules().isEmpty()) {
            ProductBusinessRule rule = product.getBusinessRules().get(0);
            minTerm = rule.getTermLimitMin();
            maxTerm = rule.getTermLimitMax();
            minRate = rule.getRateLimitMin();
            maxRate = rule.getRateLimitMax();
        }
        if (minRate == null || maxRate == null || minRate < 0 || maxRate < minRate) {
            throw new InvalidProductException("Product rate limits are not configured");
        }

        if (request.getTermMonths() != null && minTerm != null && maxTerm != null) {
            if (request.getTermMonths() < minTerm || request.getTermMonths() > maxTerm) {
                throw new InvalidProductException("Requested term (" + request.getTermMonths() + " months) is outside product allowed range [" + minTerm + ", " + maxTerm + "] months");
            }
        }

        double baseRate = minRate;
        double rateModifier = 0.0;
        String category = request.getCustomerCategory() != null
                ? request.getCustomerCategory().trim().toUpperCase().replace(' ', '_') : "GENERAL";

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
                    .orElse(0.0);
        }

        double calculatedRate = baseRate + rateModifier;
        // Rate variations grant category-specific adjustments; their absence does not
        // make the product unavailable to that customer category. Keep the base rate.
        // Clamp within product rate limits
        double finalRate = Math.max(minRate, Math.min(calculatedRate, maxRate));

        return RateCalculationResponseDTO.builder()
                .productCode(product.getProductCode())
                .productName(product.getProductName())
                .termMonths(request.getTermMonths())
                .customerCategory(category)
                .baseRate(baseRate)
                .rateModifier(rateModifier)
                .finalRate(Math.round(finalRate * 100.0) / 100.0)
                .minRateLimit(minRate)
                .maxRateLimit(maxRate)
                .build();
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

        LocalDate today = LocalDate.now();
        return products.stream()
                .filter(p -> p.getEffectiveDate() == null || !today.isBefore(p.getEffectiveDate()))
                .filter(p -> p.getEndDate() == null || today.isBefore(p.getEndDate()) || today.isEqual(p.getEndDate()))
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
        validateProduct(productCode, null, null, null);
        log.info("Fetching calculator config for product: {}", productCode);
        Product product = productRepository.findByProductCode(productCode)
                .orElseThrow(() -> new ProductNotFoundException("Product with code " + productCode + " not found"));

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new ProductInactiveException("Product with code " + productCode + " is not ACTIVE");
        }

        Integer minTerm = null;
        Integer maxTerm = null;
        java.math.BigDecimal minRate = null;
        java.math.BigDecimal maxRate = null;

        if (product.getBusinessRules() != null && !product.getBusinessRules().isEmpty()) {
            ProductBusinessRule rule = product.getBusinessRules().get(0);
            minTerm = rule.getTermLimitMin();
            maxTerm = rule.getTermLimitMax();
            minRate = java.math.BigDecimal.valueOf(rule.getRateLimitMin());
            maxRate = java.math.BigDecimal.valueOf(rule.getRateLimitMax());
        }
        if (minRate == null || maxRate == null) throw new InvalidProductException("Product rate limits are not configured");

        java.util.Map<String, java.math.BigDecimal> bonuses = new java.util.HashMap<>();
        if (product.getRateVariations() != null) {
            product.getRateVariations().forEach(v -> bonuses.put(v.getCustomerCategory().trim().toUpperCase(), java.math.BigDecimal.valueOf(v.getRateModifier())));
        }
        return CalculatorConfigDTO.builder()
                .categoryBonuses(bonuses)
                .productCode(product.getProductCode())
                .productName(product.getProductName())
                .productType(product.getProductType())
                .status(product.getStatus().name())
                .currency(product.getCurrency())
                .minPrincipal(product.getMinDeposit() == null ? null : java.math.BigDecimal.valueOf(product.getMinDeposit()))
                .maxPrincipal(product.getMaxDeposit() == null ? null : java.math.BigDecimal.valueOf(product.getMaxDeposit()))
                .termLimit(CalculatorConfigDTO.TermLimit.builder()
                        .minMonths(minTerm != null ? minTerm : 0)
                        .maxMonths(maxTerm != null ? maxTerm : 120)
                        .build())
                .rateLimit(CalculatorConfigDTO.RateLimit.builder()
                        .minRate(minRate)
                        .maxRate(maxRate)
                        .build())
                .baseRate(minRate)
                .interestType("COMPOUND")
                .compoundingFrequency(product.getCompoundingFrequency())
                .supportsPeriodicPayout("FD".equalsIgnoreCase(product.getProductType()))
                .build();
    }

    private void validateProductRequest(ProductRequestDTO dto) {
        if (dto.getEffectiveDate() == null) throw new InvalidProductException("Effective date is mandatory");
        if (dto.getEndDate() != null && dto.getEndDate().isBefore(dto.getEffectiveDate())) throw new InvalidProductException("Effective date cannot be after end date");
        if (dto.getTermLimit() == null || dto.getTermLimit().getMin() == null || dto.getTermLimit().getMax() == null || dto.getTermLimit().getMin() < 1) throw new InvalidProductException("Invalid term limits");
        if (dto.getRateLimit() == null || dto.getRateLimit().getMin() == null || dto.getRateLimit().getMax() == null || !Double.isFinite(dto.getRateLimit().getMin()) || !Double.isFinite(dto.getRateLimit().getMax()) || dto.getRateLimit().getMin() < 0) throw new InvalidProductException("Invalid rate limits");
        if (dto.getMinDeposit() != null && dto.getMinDeposit() < 0 || dto.getMaxDeposit() != null && dto.getMaxDeposit() < 0 || dto.getMinDeposit() != null && dto.getMaxDeposit() != null && dto.getMinDeposit() > dto.getMaxDeposit()) throw new InvalidProductException("Invalid deposit limits");
        if (dto.getRateVariations() != null && dto.getRateVariations().stream().anyMatch(v -> v == null || v.getCustomerCategory() == null || v.getRateModifier() == null || !Double.isFinite(v.getRateModifier()))) throw new InvalidProductException("Invalid rate variation");
        if (java.util.stream.Stream.of(dto.getTaxRate(), dto.getServiceFeeRate(), dto.getServiceFeeFlat(), dto.getDocumentationFee(), dto.getGstRate(), dto.getPrematurePenaltyRate())
                .filter(java.util.Objects::nonNull).anyMatch(value -> !Double.isFinite(value) || value < 0)) throw new InvalidProductException("Charge and tax configuration values must be finite and non-negative");
        if (dto.getCompoundingFrequency() != null && !java.util.Set.of("ANNUAL", "ANNUALLY", "YEARLY", "SEMI_ANNUAL", "SEMI-ANNUAL", "HALF_YEARLY", "QUARTERLY", "MONTHLY", "DAILY", "ON_MATURITY", "1", "2", "4", "12", "365").contains(dto.getCompoundingFrequency().trim().toUpperCase())) throw new InvalidProductException("Unsupported compounding frequency");
        if (dto.getChargeDetails() != null && dto.getChargeDetails().stream().anyMatch(charge -> charge == null || charge.getChargeType() == null || charge.getChargeValue() == null || !Double.isFinite(charge.getChargeValue()) || charge.getChargeValue() < 0 || charge.getChargeUnit() == null || !java.util.Set.of("flat", "percentage").contains(charge.getChargeUnit().trim().toLowerCase()))) throw new InvalidProductException("Invalid product charge configuration");
        if (dto.getAllowedRoles() != null) {
            java.util.Set<String> validRoles = java.util.Set.of("OWNER", "CO-OWNER", "NOMINEE");
            java.util.Set<String> configuredRoles = dto.getAllowedRoles().stream()
                    .filter(java.util.Objects::nonNull).map(String::trim).map(String::toUpperCase)
                    .collect(java.util.stream.Collectors.toSet());
            if (configuredRoles.size() != dto.getAllowedRoles().size()
                    || !validRoles.containsAll(configuredRoles)
                    || !configuredRoles.contains("OWNER")) {
                throw new InvalidProductException("Allowed roles must contain OWNER and may contain CO-OWNER or NOMINEE");
            }
        }
        if (dto.getRateVariations() != null) {
            java.util.Set<String> categories = new java.util.HashSet<>();
            for (RateVariationDTO variation : dto.getRateVariations()) {
                String category = variation.getCustomerCategory().trim().toUpperCase().replace(' ', '_');
                if (category.isEmpty() || !categories.add(category)) {
                    throw new InvalidProductException("Customer categories must be non-empty and unique");
                }
            }
        }

        if (dto.getCurrency() == null || dto.getCurrency().trim().isEmpty()) {
            throw new InvalidProductException("Currency is mandatory");
        }

        if (dto.getStatus() == null || dto.getStatus().trim().isEmpty()) {
            throw new InvalidProductException("Status is mandatory");
        }

        try {
            ProductStatus.valueOf(dto.getStatus().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidProductException("Status must be ACTIVE or INACTIVE only");
        }

        if (dto.getTermLimit() != null) {
            Integer min = dto.getTermLimit().getMin();
            Integer max = dto.getTermLimit().getMax();
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
            Double min = dto.getRateLimit().getMin();
            Double max = dto.getRateLimit().getMax();
            if (min != null && min < 0) {
                throw new InvalidProductException("Minimum interest cannot be negative");
            }
            if (max != null && max < 0) {
                throw new InvalidProductException("Maximum interest cannot be negative");
            }
            if (min != null && max != null && min > max) {
                throw new InvalidProductException("Minimum interest cannot be greater than maximum interest");
            }
        }

        if (dto.getMinDeposit() != null && dto.getMaxDeposit() != null && dto.getMinDeposit() > dto.getMaxDeposit()) {
            throw new InvalidProductException("Minimum deposit amount cannot be greater than maximum deposit amount");
        }

        if (dto.getMinWithdrawal() != null && dto.getMaxWithdrawal() != null && dto.getMinWithdrawal() > dto.getMaxWithdrawal()) {
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
        if (dto.getRateLimit() != null) {
            Double newMin = dto.getRateLimit().getMin();
            Double newMax = dto.getRateLimit().getMax();

            Double finalMin = newMin != null ? newMin : existingProduct.getMinimumInterest();
            Double finalMax = newMax != null ? newMax : existingProduct.getMaximumInterest();

            if (finalMin != null && finalMax != null && finalMin > finalMax) {
                throw new InvalidProductException("Minimum interest cannot be greater than maximum interest");
            }
        }

        if (dto.getMinDeposit() != null && dto.getMaxDeposit() != null && dto.getMinDeposit() > dto.getMaxDeposit()) {
            throw new InvalidProductException("Minimum deposit amount cannot be greater than maximum deposit amount");
        }
    }
}
