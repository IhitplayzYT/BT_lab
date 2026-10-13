package com.bank.calculator.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request body for {@code POST /api/v1/fd/calculations/compare}.
 * Accepts one principal and 2–3 product/term options to compare.
 */
@Schema(description = "FD comparison request: one principal, up to 3 product/term options")
public record ComparisonRequest(

    @Schema(description = "Principal amount in INR", example = "100000.00")
    @NotNull(message = "Principal is required")
    @DecimalMin(value = "0.01", message = "Principal must be greater than zero")
    @Digits(integer = 10, fraction = 2, message = "Principal must have at most 2 decimal places")
    BigDecimal principal,

    @Schema(description = "2 to 3 product/term options to compare")
    @NotEmpty(message = "At least one comparison option is required")
    @Size(min = 2, max = 3, message = "Provide 2 to 3 comparison options")
    @Valid
    List<ComparisonOptionDto> options

) {}
