package com.bank.calculator.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

/**
 * Breakdown of a category bonus applied during a calculation.
 */
@Schema(description = "Category benefit applied during FD maturity calculation")
public record CategoryBenefitDto(

    @Schema(description = "Customer category", example = "SENIOR_CITIZEN")
    String category,

    @Schema(description = "Bonus percentage configured for this category", example = "1.00")
    BigDecimal requestedBonus,

    @Schema(description = "Bonus actually applied after cap enforcement", example = "1.00")
    BigDecimal appliedBonus

) {}
