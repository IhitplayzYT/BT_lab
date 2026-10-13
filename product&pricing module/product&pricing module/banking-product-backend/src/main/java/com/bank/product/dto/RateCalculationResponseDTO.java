package com.bank.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "FD rate calculation response")
public record RateCalculationResponseDTO(
        @Schema(description = "Product code", example = "FD001")
        String productCode,

        @Schema(description = "Product name", example = "Fixed Deposit - Short Term")
        String productName,

        @Schema(description = "Term in months", example = "12")
        Integer termMonths,

        @Schema(description = "Customer category applied", example = "SENIOR_CITIZEN")
        String customerCategory,

        @Schema(description = "Base rate before modifier (%)", example = "6.50")
        java.math.BigDecimal baseRate,

        @Schema(description = "Rate modifier applied (%)", example = "1.00")
        java.math.BigDecimal rateModifier,

        @Schema(description = "Final calculated rate (%)", example = "7.50")
        java.math.BigDecimal finalRate,

        @Schema(description = "Minimum rate limit for product (%)", example = "5.00")
        java.math.BigDecimal minRateLimit,

        @Schema(description = "Maximum rate limit for product (%)", example = "9.00")
        java.math.BigDecimal maxRateLimit
) {
}
