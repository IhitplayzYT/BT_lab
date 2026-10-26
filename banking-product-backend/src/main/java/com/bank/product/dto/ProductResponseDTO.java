package com.bank.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponseDTO {
    private Long productId;
    private String productCode;
    private String productName;
    private String productType;
    private String currency;
    private LocalDate effectiveDate;
    private LocalDate endDate;
    private TermLimitDTO termLimit;
    private RateLimitDTO rateLimit;
    private String status;
    private String interestType;
    private Integer minAge;
    private Double minDeposit;
    private Double maxDeposit;
    private Double minWithdrawal;
    private Double maxWithdrawal;
    private String allowedTransactionTypes;
    private String balanceTypes;
    private ChargesDTO charges;
    private Double taxRate;
    private Double serviceFeeRate;
    private Double serviceFeeFlat;
    private Double documentationFee;
    private Double gstRate;
    private Double prematurePenaltyRate;
    private String compoundingFrequency;
    private List<ProductChargeDTO> chargeDetails;
    private List<String> allowedRoles;
    private List<RateVariationDTO> rateVariations;
    private String createdBy;
    private String updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
