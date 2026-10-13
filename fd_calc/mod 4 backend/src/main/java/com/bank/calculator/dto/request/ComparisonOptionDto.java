package com.bank.calculator.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** A single option within a comparison request. */
@Schema(description = "One product/term option for comparison")
public record ComparisonOptionDto(

    @Schema(description = "Product code", example = "FD001")
    @NotBlank(message = "Product code is required")
    String productCode,

    @Schema(description = "FD term for this option")
    @NotNull(message = "Term is required")
    @Valid
    TermDto term

) {}
