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
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FdCalculatorServiceImpl implements FdCalculatorService {

    private final ProductClient productClient;
    private final FdCalculationRepository fdCalculationRepository;

    // Configurable stacking cap limit
    private static final double CATEGORY_ADDITION_CAP = 2.0;

    // Default rates matrix fallback
    private static final Map<String, Double> DEFAULT_CATEGORIES = Map.of(
            "SENIOR_CITIZEN", 1.0,
            "EMPLOYEE", 0.5,
            "CORPORATE", 0.2
    );

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
            try {
                fetchedProduct = productClient.getProduct(dto.getProductCode());
                // Fallback to minimum base rate from product limits
                baseRate = (fetchedProduct.getRateLimit() != null && fetchedProduct.getRateLimit().getMin() != null) 
                        ? fetchedProduct.getRateLimit().getMin() : 0.0;
            } catch (Exception e) {
                log.error("Failed to retrieve product details for productCode: {}. Error: {}", dto.getProductCode(), e.getMessage());
                if (dto.getBaseRate() == null) {
                    throw new InvalidCalculationInputException("Product code " + dto.getProductCode() + " not found, and no baseRate was provided.");
                }
                baseRate = dto.getBaseRate();
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
                }

                // Fallback to default static rate matrix
                if (modifier == null) {
                    modifier = DEFAULT_CATEGORIES.get(normalized);
                }

                if (modifier == null) {
                    throw new UnknownCategoryException("Customer category not recognized: " + category);
                }

                categoryAdditions += modifier;
            }
        }

        // Apply clamping cap to stacked categories
        double clampedAdditions = Math.min(categoryAdditions, CATEGORY_ADDITION_CAP);
        double effectiveRate = baseRate + clampedAdditions;

        // 4. Term conversion to years (t)
        double termYears = convertTermToYears(dto.getTerm().getValue(), dto.getTerm().getUnit());

        // Determine currency
        String resolvedCurrency = dto.getCurrency();
        String productCurrency = null;
        if (dto.getProductCode() != null && !dto.getProductCode().isEmpty()) {
            try {
                ProductResponseDTO product = productClient.getProduct(dto.getProductCode());
                if (product != null && product.getCurrency() != null) {
                    productCurrency = product.getCurrency();
                }
            } catch (Exception e) {
                log.warn("Failed to fetch product currency: {}.", e.getMessage());
            }
        }
        if (resolvedCurrency == null || resolvedCurrency.isEmpty()) {
            resolvedCurrency = productCurrency != null ? productCurrency : "INR";
        }

        // 5. Apply formulas with BigDecimal precision, managing conversion if needed
        BigDecimal originalPrincipal = dto.getPrincipal();
        BigDecimal activeCalculationPrincipal = originalPrincipal;
        BigDecimal exchangeRate = BigDecimal.valueOf(96.0); // 1 USD = 96 INR
        boolean isConverted = false;
        Double conversionRateValue = null;

        if (productCurrency != null && !productCurrency.equalsIgnoreCase(resolvedCurrency)) {
            isConverted = true;
            conversionRateValue = 96.0;
            if ("USD".equalsIgnoreCase(resolvedCurrency) && "INR".equalsIgnoreCase(productCurrency)) {
                // Calculation is USD, product is INR. Convert input from USD to INR
                activeCalculationPrincipal = activeCalculationPrincipal.multiply(exchangeRate);
            } else if ("INR".equalsIgnoreCase(resolvedCurrency) && "USD".equalsIgnoreCase(productCurrency)) {
                // Calculation is INR, product is USD. Convert input from INR to USD
                activeCalculationPrincipal = activeCalculationPrincipal.divide(exchangeRate, 10, RoundingMode.HALF_UP);
            }
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
            int n = dto.getCompoundingFrequency() != null ? dto.getCompoundingFrequency() : 4; // default to quarterly
            if (n <= 0) {
                throw new InvalidCalculationInputException("Compounding frequency must be greater than zero");
            }
            
            BigDecimal rateVal = BigDecimal.valueOf(effectiveRate);
            BigDecimal base = BigDecimal.ONE.add(
                    rateVal.divide(BigDecimal.valueOf(n * 100), 10, RoundingMode.HALF_UP)
            );
            
            int totalPeriods = (int) Math.round(n * termYears);
            if (totalPeriods < 1) {
                totalPeriods = 1;
            }
            
            BigDecimal multiplier = base.pow(totalPeriods);
            maturityAmount = activeCalculationPrincipal.multiply(multiplier);
        } else {
            throw new InvalidCalculationInputException("Interest type must be either SIMPLE or COMPOUND");
        }

        // Round final monetary results to 2 decimal places in calculation currency (after converting back)
        BigDecimal roundedMaturity = maturityAmount;
        BigDecimal roundedInterest;

        if (isConverted) {
            if ("USD".equalsIgnoreCase(resolvedCurrency) && "INR".equalsIgnoreCase(productCurrency)) {
                // Convert back from INR to USD
                roundedMaturity = roundedMaturity.divide(exchangeRate, 10, RoundingMode.HALF_UP);
            } else if ("INR".equalsIgnoreCase(resolvedCurrency) && "USD".equalsIgnoreCase(productCurrency)) {
                // Convert back from USD to INR
                roundedMaturity = roundedMaturity.multiply(exchangeRate);
            }
        }
        
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
        basicRequest.setProductCode(dto.getProductCode());
        basicRequest.setCategories(dto.getCategories());
        basicRequest.setInterestType(dto.getInterestType());
        basicRequest.setCurrency(dto.getCurrency());
        basicRequest.setCompoundingFrequency(dto.getCompoundingFrequency());
        
        FdCalculationResponseDTO basicResponse = calculateMaturity(basicRequest);
        
        // 4. Calculate detailed charges
        List<ChargeItemDTO> charges = new ArrayList<>();
        BigDecimal grossInterest = basicResponse.getInterestEarned();
        BigDecimal totalDeductions = BigDecimal.ZERO;
        
        // Tax Deduction (TDS) - 10% for interest above ₹40,000 (₹50,000 for senior citizens)
        BigDecimal taxDeduction = calculateTaxDeduction(grossInterest, dto.getAge());
        if (taxDeduction.compareTo(BigDecimal.ZERO) > 0) {
            charges.add(new ChargeItemDTO(
                    "TDS",
                    "TAX",
                    "Tax Deducted at Source",
                    taxDeduction,
                    "PERCENTAGE",
                    BigDecimal.valueOf(10.0),
                    true
            ));
            totalDeductions = totalDeductions.add(taxDeduction);
        }
        
        // Service Fees - flat fee based on principal amount
        BigDecimal serviceFee = calculateServiceFee(dto.getPrincipal());
        charges.add(new ChargeItemDTO(
                "SERVICE_FEE",
                "SERVICE",
                "Account maintenance and processing fees",
                serviceFee,
                "FLAT",
                null,
                true
        ));
        totalDeductions = totalDeductions.add(serviceFee);
        
        // Documentation Charges - flat fee
        BigDecimal documentationFee = BigDecimal.valueOf(250.00);
        charges.add(new ChargeItemDTO(
                "DOCUMENTATION_FEE",
                "DOCUMENTATION",
                "Documentation and processing charges",
                documentationFee,
                "FLAT",
                null,
                true
        ));
        totalDeductions = totalDeductions.add(documentationFee);
        
        // Premature Withdrawal Penalty (if applicable)
        if (dto.getIncludePrematureWithdrawal() != null && dto.getIncludePrematureWithdrawal()) {
            BigDecimal prematurePenalty = calculatePrematureWithdrawalPenalty(
                    grossInterest, dto.getPrematureWithdrawalMonths(), dto.getTerm().getValue());
            if (prematurePenalty.compareTo(BigDecimal.ZERO) > 0) {
                charges.add(new ChargeItemDTO(
                        "PREMATURE_PENALTY",
                        "PENALTY",
                        "Penalty for premature withdrawal",
                        prematurePenalty,
                        "PERCENTAGE",
                        BigDecimal.valueOf(1.0),
                        true
                ));
                totalDeductions = totalDeductions.add(prematurePenalty);
            }
        }
        
        // GST on service charges (18% on service fees and documentation)
        BigDecimal gstAmount = serviceFee.add(documentationFee).multiply(BigDecimal.valueOf(0.18));
        charges.add(new ChargeItemDTO(
                "GST",
                "TAX",
                "Goods and Services Tax on service charges",
                gstAmount,
                "PERCENTAGE",
                BigDecimal.valueOf(18.0),
                true
        ));
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

    private BigDecimal calculateTaxDeduction(BigDecimal interest, Integer age) {
        // Tax exemption threshold
        BigDecimal threshold = (age != null && age >= 60) ? BigDecimal.valueOf(50000) : BigDecimal.valueOf(40000);
        
        if (interest.compareTo(threshold) <= 0) {
            return BigDecimal.ZERO;
        }
        
        // Taxable amount
        BigDecimal taxableAmount = interest.subtract(threshold);
        // TDS rate: 10%
        return taxableAmount.multiply(BigDecimal.valueOf(0.10)).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateServiceFee(BigDecimal principal) {
        // Service fee: 0.1% of principal, minimum ₹100, maximum ₹1000
        BigDecimal fee = principal.multiply(BigDecimal.valueOf(0.001)).setScale(2, RoundingMode.HALF_UP);
        fee = fee.max(BigDecimal.valueOf(100.00));
        fee = fee.min(BigDecimal.valueOf(1000.00));
        return fee;
    }

    private BigDecimal calculatePrematureWithdrawalPenalty(BigDecimal interest, Integer withdrawnMonths, Integer totalMonths) {
        if (withdrawnMonths == null || totalMonths == null) {
            return BigDecimal.ZERO;
        }
        
        // Penalty: 1% of interest if withdrawn before 6 months, 0.5% if between 6-12 months
        double penaltyRate = 0.0;
        if (withdrawnMonths < 6) {
            penaltyRate = 0.01;
        } else if (withdrawnMonths < 12) {
            penaltyRate = 0.005;
        }
        
        return interest.multiply(BigDecimal.valueOf(penaltyRate)).setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryRateDTO> getAvailableCategories() {
        List<CategoryRateDTO> categories = new ArrayList<>();
        DEFAULT_CATEGORIES.forEach((code, rate) -> {
            categories.add(new CategoryRateDTO(code, CATEGORY_NAMES.get(code), rate));
        });
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
