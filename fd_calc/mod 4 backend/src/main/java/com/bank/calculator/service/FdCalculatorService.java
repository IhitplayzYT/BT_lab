package com.bank.calculator.service;

import com.bank.calculator.dto.BatchCalculationRequest;
import com.bank.calculator.dto.BatchCalculationResponse;
import com.bank.calculator.dto.request.CalculationRequest;
import com.bank.calculator.dto.request.ComparisonRequest;
import com.bank.calculator.dto.request.CustomCalculationRequest;
import com.bank.calculator.dto.response.CalculationResponse;
import com.bank.calculator.dto.response.ComparisonResponse;
import com.bank.calculator.dto.response.ProductPreviewResponse;
import org.springframework.security.core.Authentication;

/**
 * Primary facade for FD calculation operations.
 */
public interface FdCalculatorService {

    /**
     * Performs a full maturity estimate for the authenticated customer.
     *
     * @param request        validated calculation request
     * @param authentication the verified Spring Security authentication (JWT)
     * @return calculation response with full breakdown
     */
    CalculationResponse calculate(CalculationRequest request, Authentication authentication);

    /**
     * Retrieves a previously persisted calculation audit record.
     * Enforces ownership — returns 404 if not owned by the authenticated customer.
     *
     * @param calculationId  the calculation identifier
     * @param authentication the verified authentication
     * @return the stored calculation response
     */
    CalculationResponse getCalculation(String calculationId, Authentication authentication);

    /**
     * Retrieves a previously persisted calculation audit record by persistent UUID.
     * Enforces ownership — returns 404 if not owned by the authenticated customer.
     *
     * @param uuid           the persistent UUID identifier
     * @param authentication the verified authentication
     * @return the stored calculation response
     */
    CalculationResponse getCalculationByUuid(String uuid, Authentication authentication);

    /**
     * Compares 2–3 product/term options for the same principal.
     *
     * @param request        validated comparison request
     * @param authentication the verified authentication
     * @return comparison response ordered by maturity amount descending
     */
    ComparisonResponse compare(ComparisonRequest request, Authentication authentication);

    /**
     * Returns calculator-safe constraints for the given product code.
     * Does not require authentication (rate limits are public information).
     *
     * @param productCode the FD product code
     * @return product preview response
     */
    ProductPreviewResponse previewProduct(String productCode);

    /**
     * Processes batch FD calculations.
     *
     * @param batchRequest   validated batch calculation request
     * @param authentication the verified Spring Security authentication (JWT)
     * @return batch calculation response with results
     */
    BatchCalculationResponse batchCalculate(BatchCalculationRequest batchRequest, Authentication authentication);

    /**
     * Performs a custom FD maturity calculation with user-defined parameters.
     * Bypasses Product Service and uses provided rate, interest type, and compounding frequency.
     *
     * @param request        validated custom calculation request
     * @param authentication the verified Spring Security authentication (JWT)
     * @return calculation response with full breakdown
     */
    CalculationResponse calculateCustom(CustomCalculationRequest request, Authentication authentication);
}
