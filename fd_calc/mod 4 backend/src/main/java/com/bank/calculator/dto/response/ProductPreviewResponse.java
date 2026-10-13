package com.bank.calculator.dto.response;

import com.bank.calculator.model.enums.CompoundingFrequency;
import com.bank.calculator.model.enums.InterestType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

/**
 * Calculator-safe preview of a product's constraints and configuration.
 * Never includes internal pricing details beyond what a customer may see.
 */
@Schema(description = "Calculator-safe product preview")
public record ProductPreviewResponse(

    @Schema(example = "FD001")
    String productCode,

    @Schema(example = "Fixed Deposit - Short Term")
    String productName,

    @Schema(example = "INR")
    String currency,

    @Schema(example = "1000.00")
    BigDecimal minPrincipal,

    @Schema(example = "10000000.00")
    BigDecimal maxPrincipal,

    @Schema(example = "3")
    int minTermMonths,

    @Schema(example = "36")
    int maxTermMonths,

    @Schema(example = "6.50")
    BigDecimal baseRate,

    @Schema(example = "7.50")
    BigDecimal maxRate,

    @Schema(example = "COMPOUND")
    InterestType interestType,

    @Schema(example = "MONTHLY")
    CompoundingFrequency compoundingFrequency,

    @Schema(example = "true")
    boolean supportsPeriodicPayout

) {}
