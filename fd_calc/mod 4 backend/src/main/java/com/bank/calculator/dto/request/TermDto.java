package com.bank.calculator.dto.request;

import com.bank.calculator.model.enums.TermUnit;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Represents the FD term (duration) in a calculation request.
 */
@Schema(description = "FD term (duration)")
public record TermDto(

    @Schema(description = "Term value (positive integer)", example = "12")
    @NotNull(message = "Term value is required")
    @Positive(message = "Term value must be positive")
    Integer value,

    @Schema(description = "Unit of the term: MONTHS or YEARS", example = "MONTHS")
    @NotNull(message = "Term unit is required (MONTHS or YEARS)")
    TermUnit unit

) {}
