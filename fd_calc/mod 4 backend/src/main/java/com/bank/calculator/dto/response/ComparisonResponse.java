package com.bank.calculator.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * Response for a multi-product FD comparison.
 */
@Schema(description = "FD comparison response: ranked list of calculation results")
public record ComparisonResponse(

    @Schema(description = "Each entry is a full calculation for one option, ordered by maturity amount descending")
    List<CalculationResponse> results

) {}
