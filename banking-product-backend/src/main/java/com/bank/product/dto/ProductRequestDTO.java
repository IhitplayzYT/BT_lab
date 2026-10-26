package com.bank.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequestDTO {

    @NotBlank(message = "Product code is mandatory")
    @Size(max = 50, message = "Product code must be less than 50 characters")
    private String productCode;

    @NotBlank(message = "Product name is mandatory")
    private String productName;

    @NotBlank(message = "Product type is mandatory")
    private String productType;

    @NotBlank(message = "Currency is mandatory")
    @Size(max = 10, message = "Currency code must be less than 10 characters")
    private String currency;

    private LocalDate effectiveDate;

    private LocalDate endDate;

    private TermLimitDTO termLimit;

    private RateLimitDTO rateLimit;

    @NotBlank(message = "Status is mandatory")
    @Pattern(regexp = "ACTIVE|INACTIVE|DRAFT|SUSPENDED|RETIRED", message = "Status must be ACTIVE or INACTIVE only")
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
}
