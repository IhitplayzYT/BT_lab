package com.bank.calculator.dto;

import com.bank.calculator.dto.request.CalculationRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * Request DTO for batch FD calculations.
 */
public record BatchCalculationRequest(
    @NotEmpty(message = "Calculations list cannot be empty")
    @Valid
    List<CalculationRequest> calculations,

    /**
     * Optional correlation ID for tracking the batch job.
     */
    String correlationId
) {}
