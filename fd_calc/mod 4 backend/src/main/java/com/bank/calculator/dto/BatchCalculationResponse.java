package com.bank.calculator.dto;

import com.bank.calculator.dto.response.CalculationResponse;

import java.util.List;

/**
 * Response DTO for batch FD calculations.
 */
public record BatchCalculationResponse(
    String correlationId,
    int totalCalculations,
    int successfulCalculations,
    int failedCalculations,
    List<CalculationResponse> results,
    String status,
    String message
) {}
