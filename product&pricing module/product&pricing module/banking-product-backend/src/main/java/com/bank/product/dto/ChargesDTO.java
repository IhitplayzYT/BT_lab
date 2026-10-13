package com.bank.product.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChargesDTO {
    @Size(max = 30, message = "Interest credit frequency must be at most 30 characters")
    private String interestCreditFrequency;
    private Boolean taxDeduction;
    @PositiveOrZero(message = "Withdrawal fees cannot be negative")
    @DecimalMax(value = "99999999.99", message = "Withdrawal fees are too large")
    private java.math.BigDecimal withdrawalFees;
}
