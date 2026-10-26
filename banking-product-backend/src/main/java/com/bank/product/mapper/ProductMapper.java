package com.bank.product.mapper;

import com.bank.product.dto.*;
import com.bank.product.entity.*;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMapper {

    public Product toEntity(ProductRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        List<ProductBusinessRule> businessRules = new ArrayList<>();
        if (dto.getTermLimit() != null || dto.getRateLimit() != null) {
            businessRules.add(ProductBusinessRule.builder()
                    .termLimitMin(dto.getTermLimit() != null ? dto.getTermLimit().getMin() : 0)
                    .termLimitMax(dto.getTermLimit() != null ? dto.getTermLimit().getMax() : 0)
                    .rateLimitMin(dto.getRateLimit() != null ? dto.getRateLimit().getMin() : 0.0)
                    .rateLimitMax(dto.getRateLimit() != null ? dto.getRateLimit().getMax() : 0.0)
                    .build());
        }

        List<ProductCharge> charges = new ArrayList<>();
        if (dto.getCharges() != null && dto.getChargeDetails() == null) {
            if (dto.getCharges().getInterestCreditFrequency() != null) {
                charges.add(ProductCharge.builder()
                        .chargeType("interestCredit")
                        .interestCreditFrequency(dto.getCharges().getInterestCreditFrequency())
                        .chargeValue(0.0)
                        .chargeUnit("flat")
                        .feeType("PERIODIC")
                        .build());
            }
            if (dto.getCharges().getWithdrawalFees() != null) {
                charges.add(ProductCharge.builder()
                        .chargeType("withdrawalFee")
                        .chargeValue(dto.getCharges().getWithdrawalFees())
                        .chargeUnit("percentage")
                        .feeType("EVENT_BASED")
                        .build());
            }
        }
        if (dto.getChargeDetails() != null) {
            for (ProductChargeDTO charge : dto.getChargeDetails()) {
                if (charge == null || charge.getChargeType() == null || charge.getChargeValue() == null || charge.getChargeUnit() == null) continue;
                charges.add(ProductCharge.builder()
                        .chargeType(charge.getChargeType().trim().toUpperCase())
                        .chargeValue(charge.getChargeValue())
                        .chargeUnit(charge.getChargeUnit().trim().toLowerCase())
                        .feeType(charge.getFeeType())
                        .build());
            }
        }

        List<ProductRole> roles = new ArrayList<>();
        if (dto.getAllowedRoles() != null) {
            for (String roleName : dto.getAllowedRoles()) {
                roles.add(ProductRole.builder()
                        .roleType(roleName.toLowerCase())
                        .isMandatory("owner".equalsIgnoreCase(roleName))
                        .build());
            }
        } else {
            roles.add(ProductRole.builder().roleType("owner").isMandatory(true).build());
        }

        List<RateVariation> rateVariations = new ArrayList<>();
        if (dto.getRateVariations() != null) {
            for (RateVariationDTO v : dto.getRateVariations()) {
                rateVariations.add(RateVariation.builder()
                        .customerCategory(v.getCustomerCategory().trim().toUpperCase().replace(' ', '_'))
                        .rateModifier(v.getRateModifier())
                        .build());
            }
        }

        ProductStatus status = ProductStatus.ACTIVE;
        if (dto.getStatus() != null && !dto.getStatus().trim().isEmpty()) {
            try {
                status = ProductStatus.valueOf(dto.getStatus().trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        String interestType = dto.getInterestType();
        if (interestType == null || interestType.trim().isEmpty()) {
            interestType = ("LOAN".equalsIgnoreCase(dto.getProductType())) ? "DEBIT" : "CREDIT";
        } else {
            interestType = interestType.trim().toUpperCase();
        }

        return Product.builder()
                .productCode(dto.getProductCode())
                .productName(dto.getProductName())
                .productType(dto.getProductType())
                .currency(dto.getCurrency())
                .effectiveDate(dto.getEffectiveDate())
                .endDate(dto.getEndDate())
                .status(status)
                .isActive(status == ProductStatus.ACTIVE)
                .interestType(interestType)
                .taxRate(dto.getTaxRate())
                .serviceFeeRate(dto.getServiceFeeRate())
                .serviceFeeFlat(dto.getServiceFeeFlat())
                .documentationFee(dto.getDocumentationFee())
                .gstRate(dto.getGstRate())
                .prematurePenaltyRate(dto.getPrematurePenaltyRate())
                .compoundingFrequency(dto.getCompoundingFrequency() != null ? dto.getCompoundingFrequency()
                        : dto.getCharges() != null && dto.getCharges().getInterestCreditFrequency() != null
                        ? dto.getCharges().getInterestCreditFrequency() : "QUARTERLY")
                .minAge(dto.getMinAge())
                .minDeposit(dto.getMinDeposit())
                .maxDeposit(dto.getMaxDeposit())
                .minWithdrawal(dto.getMinWithdrawal())
                .maxWithdrawal(dto.getMaxWithdrawal())
                .allowedTransactionTypes(dto.getAllowedTransactionTypes())
                .balanceTypes(dto.getBalanceTypes())
                .businessRules(businessRules)
                .charges(charges)
                .allowedRoles(roles)
                .rateVariations(rateVariations)
                .build();
    }

    public ProductResponseDTO toResponseDTO(Product entity) {
        if (entity == null) {
            return null;
        }

        TermLimitDTO termLimit = null;
        RateLimitDTO rateLimit = null;
        if (entity.getBusinessRules() != null && !entity.getBusinessRules().isEmpty()) {
            ProductBusinessRule rule = entity.getBusinessRules().get(0);
            termLimit = TermLimitDTO.builder()
                    .min(rule.getTermLimitMin())
                    .max(rule.getTermLimitMax())
                    .build();
            rateLimit = RateLimitDTO.builder()
                    .min(rule.getRateLimitMin())
                    .max(rule.getRateLimitMax())
                    .build();
        }

        ChargesDTO charges = null;
        if (entity.getCharges() != null && !entity.getCharges().isEmpty()) {
            String frequency = "ON_MATURITY";
            boolean taxDeduction = false;
            double withdrawalFees = 0.0;
            boolean canonicalWithdrawalFeeFound = false;
            for (ProductCharge charge : entity.getCharges()) {
                if ("interestCredit".equalsIgnoreCase(charge.getChargeType())) {
                    frequency = charge.getInterestCreditFrequency() != null ? charge.getInterestCreditFrequency() : "ON_MATURITY";
                } else if ("tax".equalsIgnoreCase(charge.getChargeType())) {
                    taxDeduction = charge.getChargeValue() != null && charge.getChargeValue() > 0;
                } else if ("withdrawalFee".equalsIgnoreCase(charge.getChargeType())) {
                    withdrawalFees = charge.getChargeValue() != null ? charge.getChargeValue() : 0.0;
                    canonicalWithdrawalFeeFound = true;
                } else if (!canonicalWithdrawalFeeFound
                        && "PREMATURE_WITHDRAWAL".equalsIgnoreCase(charge.getChargeType())) {
                    withdrawalFees = charge.getChargeValue() != null ? charge.getChargeValue() : 0.0;
                }
            }
            charges = ChargesDTO.builder()
                    .interestCreditFrequency(frequency)
                    .taxDeduction(taxDeduction)
                    .withdrawalFees(withdrawalFees)
                    .build();
        }

        List<String> allowedRoles = new ArrayList<>();
        if (entity.getAllowedRoles() != null) {
            for (ProductRole role : entity.getAllowedRoles()) {
                allowedRoles.add(role.getRoleType().toUpperCase());
            }
        }

        List<RateVariationDTO> rateVariations = Collections.emptyList();
        if (entity.getRateVariations() != null && !entity.getRateVariations().isEmpty()) {
            rateVariations = entity.getRateVariations().stream()
                    .map(v -> RateVariationDTO.builder()
                            .customerCategory(v.getCustomerCategory())
                            .rateModifier(v.getRateModifier())
                            .build())
                    .collect(Collectors.toList());
        }

        return ProductResponseDTO.builder()
                .productId(entity.getProductId() != null ? entity.getProductId().longValue() : null)
                .productCode(entity.getProductCode())
                .productName(entity.getProductName())
                .productType(entity.getProductType())
                .currency(entity.getCurrency())
                .effectiveDate(entity.getEffectiveDate())
                .endDate(entity.getEndDate())
                .termLimit(termLimit)
                .rateLimit(rateLimit)
                .status(entity.getStatus() != null ? entity.getStatus().name() : "ACTIVE")
                .interestType(entity.getInterestType())
                .minAge(entity.getMinAge())
                .minDeposit(entity.getMinDeposit())
                .maxDeposit(entity.getMaxDeposit())
                .minWithdrawal(entity.getMinWithdrawal())
                .maxWithdrawal(entity.getMaxWithdrawal())
                .allowedTransactionTypes(entity.getAllowedTransactionTypes())
                .balanceTypes(entity.getBalanceTypes())
                .charges(charges)
                .taxRate(entity.getTaxRate())
                .serviceFeeRate(entity.getServiceFeeRate())
                .serviceFeeFlat(entity.getServiceFeeFlat())
                .documentationFee(entity.getDocumentationFee())
                .gstRate(entity.getGstRate())
                .prematurePenaltyRate(entity.getPrematurePenaltyRate())
                .compoundingFrequency(entity.getCompoundingFrequency())
                .chargeDetails(entity.getCharges() == null ? Collections.emptyList() : entity.getCharges().stream()
                        .map(charge -> ProductChargeDTO.builder()
                                .chargeType(charge.getChargeType())
                                .chargeValue(charge.getChargeValue())
                                .chargeUnit(charge.getChargeUnit())
                                .feeType(charge.getFeeType())
                                .build())
                        .collect(Collectors.toList()))
                .allowedRoles(allowedRoles)
                .rateVariations(rateVariations)
                .createdBy(entity.getOooUserId())
                .updatedBy(entity.getUpdatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public ProductDefaultsResponseDTO toDefaultsResponseDTO(Product entity) {
        if (entity == null) {
            return null;
        }

        ProductResponseDTO res = toResponseDTO(entity);
        Integer defaultTerm = res.getTermLimit() != null ? res.getTermLimit().getMin() : 12;
        Double defaultRate = res.getRateLimit() != null ? res.getRateLimit().getMin() : 5.0;
        Double defaultAmt = entity.getMinDeposit() != null ? entity.getMinDeposit() : 10000.0;

        return ProductDefaultsResponseDTO.builder()
                .productCode(entity.getProductCode())
                .productName(entity.getProductName())
                .productType(entity.getProductType())
                .currency(entity.getCurrency())
                .defaultTermMonths(defaultTerm)
                .minTermMonths(res.getTermLimit() != null ? res.getTermLimit().getMin() : null)
                .maxTermMonths(res.getTermLimit() != null ? res.getTermLimit().getMax() : null)
                .defaultAmount(defaultAmt)
                .minDeposit(entity.getMinDeposit())
                .maxDeposit(entity.getMaxDeposit())
                .defaultRate(defaultRate)
                .minRate(res.getRateLimit() != null ? res.getRateLimit().getMin() : null)
                .maxRate(res.getRateLimit() != null ? res.getRateLimit().getMax() : null)
                .interestType(entity.getInterestType())
                .charges(res.getCharges())
                .allowedRoles(res.getAllowedRoles())
                .rateVariations(res.getRateVariations())
                .build();
    }
}
