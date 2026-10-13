package com.bank.calculator.service;

import com.bank.calculator.dto.response.CalculationResponse;

/**
 * Generates a deterministic, human-readable plain-language explanation
 * for a completed FD calculation.
 *
 * <p>This service operates on an already-computed {@link CalculationResponse}
 * and never determines rates, eligibility, categories, maturity values, or
 * any financial output.  All numbers it references come from the
 * pre-computed response.
 *
 * <p>There is no AI integration in this implementation.  The explanation
 * is template-based and fully deterministic.
 */
public interface ExplainService {

    /**
     * Returns a plain-language explanation for the given calculation result.
     *
     * @param response the already-computed calculation response
     * @return human-readable explanation string
     */
    String explain(CalculationResponse response);
}
