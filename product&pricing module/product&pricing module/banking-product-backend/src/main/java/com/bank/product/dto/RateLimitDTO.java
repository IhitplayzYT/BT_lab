package com.bank.product.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotNull;

public record RateLimitDTO(
        @NotNull(message = "Rate limit minimum is mandatory")
        @DecimalMax(value = "999.99", message = "Rate limit minimum must be at most 999.99")
        java.math.BigDecimal min,
        @NotNull(message = "Rate limit maximum is mandatory")
        @DecimalMax(value = "999.99", message = "Rate limit maximum must be at most 999.99")
        java.math.BigDecimal max
) {
}
