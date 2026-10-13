package com.bank.product.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
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
    @Size(max = 100, message = "Product name must be at most 100 characters")
    private String productName;

    @NotBlank(message = "Product type is mandatory")
    @Size(max = 20, message = "Product type must be at most 20 characters")
    private String productType;

    @NotBlank(message = "Currency is mandatory")
    @Size(max = 10, message = "Currency code must be less than 10 characters")
    private String currency;

    @NotNull(message = "Effective date is mandatory")
    private LocalDate effectiveDate;

    private LocalDate endDate;

    @Valid
    private TermLimitDTO termLimit;

    @Valid
    private RateLimitDTO rateLimit;

    @NotBlank(message = "Status is mandatory")
    @Pattern(regexp = "ACTIVE|INACTIVE|DRAFT|SUSPENDED|RETIRED", message = "Status must be one of ACTIVE, INACTIVE, DRAFT, SUSPENDED, RETIRED")
    private String status;

    @Size(max = 10, message = "Interest type must be at most 10 characters")
    private String interestType;

    @PositiveOrZero(message = "Minimum age cannot be negative")
    private Integer minAge;

    @PositiveOrZero(message = "Minimum deposit cannot be negative")
    @DecimalMax(value = "9999999999999.99", message = "Minimum deposit is too large")
    private java.math.BigDecimal minDeposit;

    @PositiveOrZero(message = "Maximum deposit cannot be negative")
    @DecimalMax(value = "9999999999999.99", message = "Maximum deposit is too large")
    private java.math.BigDecimal maxDeposit;

    @PositiveOrZero(message = "Minimum withdrawal cannot be negative")
    @DecimalMax(value = "9999999999999.99", message = "Minimum withdrawal is too large")
    private java.math.BigDecimal minWithdrawal;

    @PositiveOrZero(message = "Maximum withdrawal cannot be negative")
    @DecimalMax(value = "9999999999999.99", message = "Maximum withdrawal is too large")
    private java.math.BigDecimal maxWithdrawal;

    @Size(max = 255, message = "Allowed transaction types must be at most 255 characters")
    private String allowedTransactionTypes;

    @Size(max = 255, message = "Balance types must be at most 255 characters")
    private String balanceTypes;

    @Valid
    private ChargesDTO charges;

    private List<@NotBlank(message = "Allowed role cannot be blank") @Size(max = 20, message = "Allowed role must be at most 20 characters") String> allowedRoles;

    private List<@Valid @NotNull(message = "Rate variation cannot be null") RateVariationDTO> rateVariations;
}
