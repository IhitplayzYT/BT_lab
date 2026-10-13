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
                    .termLimitMin(dto.getTermLimit() != null ? dto.getTermLimit().min() : 0)
                    .termLimitMax(dto.getTermLimit() != null ? dto.getTermLimit().max() : 0)
                    .rateLimitMin(dto.getRateLimit() != null ? dto.getRateLimit().min() : java.math.BigDecimal.ZERO)
                    .rateLimitMax(dto.getRateLimit() != null ? dto.getRateLimit().max() : java.math.BigDecimal.ZERO)
                    .build());
        }

        List<ProductCharge> charges = new ArrayList<>();
        if (dto.getCharges() != null) {
            if (dto.getCharges().getInterestCreditFrequency() != null) {
                charges.add(ProductCharge.builder()
                        .chargeType("interestCredit")
                        .chargeValue(java.math.BigDecimal.ZERO)
                        .chargeUnit("flat")
                        .feeType(dto.getCharges().getInterestCreditFrequency().trim().toUpperCase())
                        .build());
            }
            if (dto.getCharges().getTaxDeduction() != null) {
                charges.add(ProductCharge.builder()
                        .chargeType("tax")
                        .chargeValue(dto.getCharges().getTaxDeduction() ? java.math.BigDecimal.valueOf(10.0) : java.math.BigDecimal.ZERO)
                        .chargeUnit("percentage")
                        .feeType("EVENT_BASED")
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

        List<ProductRole> roles = new ArrayList<>();
        if (dto.getAllowedRoles() != null) {
            for (String roleName : dto.getAllowedRoles()) {
                roles.add(ProductRole.builder()
                        .roleType(roleName.toLowerCase())
                        .isMandatory("owner".equalsIgnoreCase(roleName))
                        .build());
            }
        }

        List<RateVariation> rateVariations = new ArrayList<>();
        if (dto.getRateVariations() != null) {
            for (RateVariationDTO v : dto.getRateVariations()) {
                rateVariations.add(RateVariation.builder()
                        .customerCategory(v.getCustomerCategory())
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
            termLimit = new TermLimitDTO(rule.getTermLimitMin(), rule.getTermLimitMax());
            rateLimit = new RateLimitDTO(rule.getRateLimitMin(), rule.getRateLimitMax());
        }

        ChargesDTO charges = null;
        if (entity.getCharges() != null && !entity.getCharges().isEmpty()) {
            String frequency = "ON_MATURITY";
            boolean taxDeduction = false;
            java.math.BigDecimal withdrawalFees = java.math.BigDecimal.ZERO;
            for (ProductCharge charge : entity.getCharges()) {
                if ("interestCredit".equalsIgnoreCase(charge.getChargeType())) {
                    // Rows written before this fix (and seed data) hold PERIODIC/null here: keep the old default.
                    String stored = charge.getFeeType();
                    if (stored != null && !stored.isBlank() && !"PERIODIC".equalsIgnoreCase(stored)) {
                        frequency = stored;
                    }
                } else if ("tax".equalsIgnoreCase(charge.getChargeType())) {
                    taxDeduction = charge.getChargeValue() != null && charge.getChargeValue().compareTo(java.math.BigDecimal.ZERO) > 0;
                } else if ("withdrawalFee".equalsIgnoreCase(charge.getChargeType())) {
                    withdrawalFees = charge.getChargeValue() != null ? charge.getChargeValue() : java.math.BigDecimal.ZERO;
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
        Integer defaultTerm = res.getTermLimit() != null ? res.getTermLimit().min() : 12;
        java.math.BigDecimal defaultRate = res.getRateLimit() != null ? res.getRateLimit().min() : java.math.BigDecimal.valueOf(5.0);
        java.math.BigDecimal defaultAmt = entity.getMinDeposit() != null ? entity.getMinDeposit() : java.math.BigDecimal.valueOf(10000.0);

        return ProductDefaultsResponseDTO.builder()
                .productCode(entity.getProductCode())
                .productName(entity.getProductName())
                .productType(entity.getProductType())
                .currency(entity.getCurrency())
                .defaultTermMonths(defaultTerm)
                .minTermMonths(res.getTermLimit() != null ? res.getTermLimit().min() : null)
                .maxTermMonths(res.getTermLimit() != null ? res.getTermLimit().max() : null)
                .defaultAmount(defaultAmt)
                .minDeposit(entity.getMinDeposit())
                .maxDeposit(entity.getMaxDeposit())
                .defaultRate(defaultRate)
                .minRate(res.getRateLimit() != null ? res.getRateLimit().min() : null)
                .maxRate(res.getRateLimit() != null ? res.getRateLimit().max() : null)
                .interestType(entity.getInterestType())
                .charges(res.getCharges())
                .allowedRoles(res.getAllowedRoles())
                .rateVariations(res.getRateVariations())
                .build();
    }
}
