package com.bank.fdcalculator.service.impl;

import com.bank.fdcalculator.client.ProductClient;
import com.bank.fdcalculator.dto.*;
import com.bank.fdcalculator.exception.InvalidCalculationInputException;
import com.bank.fdcalculator.exception.UnknownCategoryException;
import com.bank.fdcalculator.service.FdCalculatorService;
import com.bank.fdcalculator.entity.FdCalculation;
import com.bank.fdcalculator.repository.FdCalculationRepository;
import com.bank.product.dto.ProductResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class FdCalculatorServiceImpl implements FdCalculatorService {

    private final ProductClient productClient;
    private final FdCalculationRepository fdCalculationRepository;

    private static final Map<String, String> CATEGORY_NAMES = Map.of(
            "SENIOR_CITIZEN", "Senior Citizen",
            "EMPLOYEE", "Bank Employee",
            "CORPORATE", "Corporate Client"
    );

    @Override
    public FdCalculationResponseDTO calculateMaturity(FdCalculationRequestDTO dto) {
        log.info("Starting maturity calculation for principal: {}, type: {}", dto.getPrincipal(), dto.getInterestType());

        // 1. Validate Core Inputs
        validateInputs(dto);

        // 2. Resolve Base Rate
        double baseRate;
        ProductResponseDTO fetchedProduct = null;

        if (dto.getProductCode() != null && !dto.getProductCode().trim().isEmpty()) {
            fetchedProduct = productClient.getProduct(dto.getProductCode());
            if (fetchedProduct.getRateLimit() == null || fetchedProduct.getRateLimit().getMin() == null
                    || fetchedProduct.getRateLimit().getMax() == null) {
                throw new InvalidCalculationInputException("Product rate limits are not configured");
            }
            double minimumRate = fetchedProduct.getRateLimit().getMin();
            double maximumRate = fetchedProduct.getRateLimit().getMax();
            baseRate = dto.getBaseRate() == null ? minimumRate : dto.getBaseRate();
            if (baseRate < minimumRate || baseRate > maximumRate) {
                throw new InvalidCalculationInputException("Base rate must be within the product rate limits");
            }
        } else if (dto.getBaseRate() != null) {
            baseRate = dto.getBaseRate();
        } else {
            throw new InvalidCalculationInputException("Either productCode or baseRate must be specified.");
        }

        // 3. Resolve Category Overrides and Stacking additions
        double categoryAdditions = 0.0;
        if (dto.getCategories() != null) {
            for (String category : dto.getCategories()) {
                String normalized = category.trim().toUpperCase().replace(" ", "_");
                Double modifier = null;

                // First try product variations lookup if product was successfully fetched
                if (fetchedProduct != null && fetchedProduct.getRateVariations() != null) {
                    modifier = fetchedProduct.getRateVariations().stream()
                            .filter(v -> v.getCustomerCategory().trim().toUpperCase().replace(" ", "_").equals(normalized))
                            .map(v -> v.getRateModifier())
                            .findFirst()
                            .orElse(null);
                    if (modifier == null && !"GENERAL".equals(normalized)
                            && !fetchedProduct.getRateVariations().isEmpty()) {
                        throw new UnknownCategoryException("Customer category " + category
                                + " is not configured for product " + dto.getProductCode());
                    }
                }

                if (modifier == null) {
                    if ("GENERAL".equals(normalized)) modifier = 0.0;
                    else throw new UnknownCategoryException("Customer category " + category
                            + " is not configured for product " + dto.getProductCode());
                }

                if (modifier == null) {
                    throw new UnknownCategoryException("Customer category not recognized: " + category);
                }

                categoryAdditions += modifier;
            }
        }

        double effectiveRate = baseRate + categoryAdditions;
        if (fetchedProduct != null && fetchedProduct.getRateLimit() != null) {
            if (fetchedProduct.getRateLimit().getMin() != null) {
                effectiveRate = Math.max(effectiveRate, fetchedProduct.getRateLimit().getMin());
            }
            if (fetchedProduct.getRateLimit().getMax() != null) {
                effectiveRate = Math.min(effectiveRate, fetchedProduct.getRateLimit().getMax());
            }
        }

        // 4. Term conversion to years (t)
        double termYears = convertTermToYears(dto.getTerm().getValue(), dto.getTerm().getUnit());

        // Determine currency
        String resolvedCurrency = dto.getCurrency();
        String productCurrency = fetchedProduct != null ? fetchedProduct.getCurrency() : null;
        if (resolvedCurrency == null || resolvedCurrency.isEmpty()) {
            resolvedCurrency = productCurrency != null ? productCurrency : "INR";
        }

        // 5. Apply the product rate and configured frequency in product currency.
        BigDecimal originalPrincipal = dto.getPrincipal();
        BigDecimal activeCalculationPrincipal = originalPrincipal;
        boolean isConverted = false;
        Double conversionRateValue = null;

        if (productCurrency != null && !productCurrency.equalsIgnoreCase(resolvedCurrency)) {
            throw new InvalidCalculationInputException("Calculation currency must match the product currency; convert the amount using a live exchange rate first.");
        }

        BigDecimal maturityAmount;
        String interestType = dto.getInterestType().trim().toUpperCase();
        if ("SIMPLE".equals(interestType)) {
            // M = P + (P * r * t / 100)
            BigDecimal rateVal = BigDecimal.valueOf(effectiveRate);
            BigDecimal timeVal = BigDecimal.valueOf(termYears);
            BigDecimal interest = activeCalculationPrincipal.multiply(rateVal).multiply(timeVal)
                    .divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP);
            maturityAmount = activeCalculationPrincipal.add(interest);
        } else if ("COMPOUND".equals(interestType)) {
            // M = P * (1 + r / (n * 100))^(n * t)
            int n = fetchedProduct != null
                    ? frequencyPerYear(fetchedProduct.getCompoundingFrequency())
                    : dto.getCompoundingFrequency() != null ? dto.getCompoundingFrequency()
                    : frequencyPerYear(null);
            if (n <= 0) {
                throw new InvalidCalculationInputException("Compounding frequency must be greater than zero");
            }
            
            double multiplier = Math.pow(1 + effectiveRate / (n * 100.0), n * termYears);
            maturityAmount = BigDecimal.valueOf(activeCalculationPrincipal.doubleValue() * multiplier);
        } else {
            throw new InvalidCalculationInputException("Interest type must be either SIMPLE or COMPOUND");
        }

        BigDecimal roundedMaturity = maturityAmount;
        BigDecimal roundedInterest;
        roundedMaturity = roundedMaturity.setScale(2, RoundingMode.HALF_UP);
        roundedInterest = roundedMaturity.subtract(originalPrincipal).setScale(2, RoundingMode.HALF_UP);

        log.info("Calculation complete. Effective Rate: {}%, Maturity Amount: {} {}", effectiveRate, roundedMaturity, resolvedCurrency);

        // Persist calculation log record to history
        try {
            FdCalculation historyRecord = FdCalculation.builder()
                    .principal(originalPrincipal)
                    .termValue(dto.getTerm().getValue())
                    .termUnit(dto.getTerm().getUnit())
                    .productCode(dto.getProductCode())
                    .effectiveRate(effectiveRate)
                    .interestType(interestType)
                    .maturityAmount(roundedMaturity)
                    .interestEarned(roundedInterest)
                    .currency(resolvedCurrency)
                    .isConverted(isConverted)
                    .conversionRate(conversionRateValue)
                    .build();
            fdCalculationRepository.save(historyRecord);
        } catch (Exception e) {
            log.error("Failed to save calculation history: {}", e.getMessage());
        }

        return new FdCalculationResponseDTO(roundedMaturity, effectiveRate, roundedInterest, resolvedCurrency, isConverted, conversionRateValue);
    }

    @Override
    public ChargeBreakdownDTO calculateAdvancedMaturity(AdvancedCalculationRequestDTO dto) {
        log.info("Starting advanced maturity calculation with charges for principal: {}, product: {}", dto.getPrincipal(), dto.getProductCode());

        // 1. Validate inputs
        if (dto.getPrincipal() == null || dto.getPrincipal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidCalculationInputException("Principal amount must be greater than zero");
        }
        if (dto.getTerm() == null || dto.getTerm().getValue() == null || dto.getTerm().getValue() <= 0) {
            throw new InvalidCalculationInputException("Term value must be greater than zero");
        }
        if (dto.getTerm().getUnit() == null || dto.getTerm().getUnit().trim().isEmpty()) {
            throw new InvalidCalculationInputException("Term unit is mandatory");
        }

        // 2. Calculate base maturity using existing logic
        FdCalculationRequestDTO basicRequest = new FdCalculationRequestDTO();
        basicRequest.setPrincipal(dto.getPrincipal());
        basicRequest.setTerm(dto.getTerm());
        basicRequest.setBaseRate(dto.getBaseRate());
        basicRequest.setProductCode(dto.getProductCode());
        basicRequest.setCategories(dto.getCategories());
        basicRequest.setInterestType(dto.getInterestType());
        basicRequest.setCurrency(dto.getCurrency());
        basicRequest.setCompoundingFrequency(dto.getCompoundingFrequency());
        
        FdCalculationResponseDTO basicResponse = calculateMaturity(basicRequest);
        ProductResponseDTO product = productClient.getProduct(dto.getProductCode());
        
        // 4. Calculate detailed charges
        List<ChargeItemDTO> charges = new ArrayList<>();
        BigDecimal grossInterest = basicResponse.getInterestEarned();
        BigDecimal totalDeductions = BigDecimal.ZERO;
        
        BigDecimal taxRate = decimal(product.getTaxRate());
        if (taxRate.signum() <= 0) {
            taxRate = configuredChargeRate(product, "TAX");
        }
        BigDecimal taxDeduction = grossInterest.multiply(taxRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        if (taxDeduction.compareTo(BigDecimal.ZERO) > 0) {
            charges.add(new ChargeItemDTO(
                    "TDS",
                    "TAX",
                    "Tax Deducted at Source",
                    taxDeduction,
                    "PERCENTAGE",
                    taxRate,
                    true
            ));
            totalDeductions = totalDeductions.add(taxDeduction);
        }
        
        BigDecimal configuredProcessingFee = configuredCharge(product, "PROCESSING_FEE", dto.getPrincipal());
        BigDecimal processingFee = configuredProcessingFee == null ? BigDecimal.ZERO : configuredProcessingFee;
        BigDecimal configuredServiceFee = configuredCharge(product, "SERVICE_FEE", dto.getPrincipal());
        BigDecimal serviceFee = configuredServiceFee != null ? configuredServiceFee
                : product.getServiceFeeRate() != null && product.getServiceFeeRate() > 0
                ? dto.getPrincipal().multiply(decimal(product.getServiceFeeRate())).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                : decimal(product.getServiceFeeFlat());
        BigDecimal configuredDocumentationFee = configuredCharge(product, "DOCUMENTATION_FEE", dto.getPrincipal());
        BigDecimal documentationFee = configuredDocumentationFee != null
                ? configuredDocumentationFee : decimal(product.getDocumentationFee());
        addCharge(charges, "PROCESSING_FEE", "PROCESSING", "Configured processing fee", processingFee);
        addCharge(charges, "SERVICE_FEE", "SERVICE", "Configured service fee", serviceFee);
        addCharge(charges, "DOCUMENTATION_FEE", "DOCUMENTATION", "Configured documentation fee", documentationFee);
        totalDeductions = totalDeductions.add(processingFee).add(serviceFee).add(documentationFee);
        
        // Premature Withdrawal Penalty (if applicable)
        if (dto.getIncludePrematureWithdrawal() != null && dto.getIncludePrematureWithdrawal()) {
            BigDecimal penaltyRate = decimal(product.getPrematurePenaltyRate());
            BigDecimal prematurePenalty = grossInterest.multiply(penaltyRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (prematurePenalty.compareTo(BigDecimal.ZERO) > 0) {
                charges.add(new ChargeItemDTO(
                        "PREMATURE_PENALTY",
                        "PENALTY",
                        "Penalty for premature withdrawal",
                        prematurePenalty,
                        "PERCENTAGE",
                        penaltyRate,
                        true
                ));
                totalDeductions = totalDeductions.add(prematurePenalty);
            }
        }
        
        BigDecimal gstRate = decimal(product.getGstRate());
        BigDecimal gstAmount = processingFee.add(serviceFee).add(documentationFee)
                .multiply(gstRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        addCharge(charges, "GST", "TAX", "GST on configured service charges", gstAmount);
        totalDeductions = totalDeductions.add(gstAmount);
        
        // Calculate net interest and final maturity
        BigDecimal netInterest = grossInterest.subtract(totalDeductions);
        BigDecimal finalMaturity = dto.getPrincipal().add(netInterest);
        
        log.info("Advanced calculation complete. Gross Interest: {}, Deductions: {}, Net Interest: {}, Final Maturity: {}",
                grossInterest, totalDeductions, netInterest, finalMaturity);
        
        return new ChargeBreakdownDTO(
                grossInterest,
                netInterest,
                totalDeductions,
                charges,
                finalMaturity,
                basicResponse.getEffectiveRate(),
                basicResponse.getCurrency(),
                basicResponse.getIsConverted(),
                basicResponse.getConversionRate()
        );
    }

    private BigDecimal decimal(Double value) {
        return value == null ? BigDecimal.ZERO : BigDecimal.valueOf(value);
    }

    private BigDecimal configuredCharge(ProductResponseDTO product, String type, BigDecimal principal) {
        if (product.getChargeDetails() == null) return null;
        Set<String> acceptedTypes = switch (type.toUpperCase(Locale.ROOT)) {
            case "PROCESSING_FEE" -> Set.of("PROCESSING_FEE", "TRANSACTION_FEE", "DEPOSIT_FEE", "ACCOUNT_OPENING_FEE", "APPLICATION_FEE");
            default -> Set.of(type.toUpperCase(Locale.ROOT));
        };
        return product.getChargeDetails().stream()
                .filter(charge -> charge.getChargeType() != null
                        && acceptedTypes.contains(charge.getChargeType().trim().toUpperCase(Locale.ROOT).replace(' ', '_')))
                .findFirst()
                .map(charge -> {
                    BigDecimal value = decimal(charge.getChargeValue());
                    return "percentage".equalsIgnoreCase(charge.getChargeUnit())
                            ? principal.multiply(value).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                            : value;
                }).orElse(null);
    }

    private BigDecimal configuredChargeRate(ProductResponseDTO product, String type) {
        if (product.getChargeDetails() == null) return BigDecimal.ZERO;
        return product.getChargeDetails().stream()
                .filter(charge -> charge.getChargeType() != null
                        && type.equalsIgnoreCase(charge.getChargeType().trim().replace(' ', '_'))
                        && "percentage".equalsIgnoreCase(charge.getChargeUnit()))
                .findFirst()
                .map(charge -> decimal(charge.getChargeValue()))
                .orElse(BigDecimal.ZERO);
    }

    private void addCharge(List<ChargeItemDTO> charges, String code, String category, String description, BigDecimal amount) {
        if (amount.signum() <= 0) return;
        charges.add(new ChargeItemDTO(code, category, description, amount, "CONFIGURED", null, true));
    }

    private int frequencyPerYear(String frequency) {
        if (frequency == null || frequency.isBlank()) throw new InvalidCalculationInputException("Product compounding frequency is not configured");
        return switch (frequency.trim().toUpperCase()) {
            case "ANNUAL", "ANNUALLY", "YEARLY", "ON_MATURITY" -> 1;
            case "SEMI_ANNUAL", "SEMI-ANNUAL", "HALF_YEARLY" -> 2;
            case "QUARTERLY" -> 4;
            case "MONTHLY" -> 12;
            case "DAILY" -> 365;
            default -> {
                try { yield Integer.parseInt(frequency.trim()); }
                catch (NumberFormatException ex) { throw new InvalidCalculationInputException("Unsupported product compounding frequency"); }
            }
        };
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryRateDTO> getAvailableCategories() {
        List<CategoryRateDTO> categories = new ArrayList<>();
        CATEGORY_NAMES.forEach((code, name) -> categories.add(new CategoryRateDTO(code, name, null)));
        return categories;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FdCalculation> getCalculationHistory() {
        return fdCalculationRepository.findAllByOrderByCalculationDateDesc();
    }

    private void validateInputs(FdCalculationRequestDTO dto) {
        if (dto.getPrincipal() == null || dto.getPrincipal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidCalculationInputException("Principal amount must be greater than zero");
        }
        if (dto.getTerm() == null || dto.getTerm().getValue() == null || dto.getTerm().getValue() <= 0) {
            throw new InvalidCalculationInputException("Term value must be greater than zero");
        }
        if (dto.getTerm().getUnit() == null || dto.getTerm().getUnit().trim().isEmpty()) {
            throw new InvalidCalculationInputException("Term unit is mandatory");
        }
    }

    private double convertTermToYears(int termValue, String unit) {
        String normalizedUnit = unit.trim().toLowerCase();
        if (normalizedUnit.startsWith("month")) {
            return (double) termValue / 12.0;
        } else if (normalizedUnit.startsWith("year")) {
            return (double) termValue;
        } else if (normalizedUnit.startsWith("day")) {
            return (double) termValue / 365.0;
        } else {
            throw new InvalidCalculationInputException("Unsupported term unit: " + unit + ". Use months, years, or days.");
        }
    }
}
