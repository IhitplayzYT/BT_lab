package com.example.fdmodule.report;

import com.example.fdmodule.security.AccountAccess;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Chart data endpoints for frontend visualization.
 * Provides JSON data for rendering charts in the UI.
 */
@RestController
@RequestMapping("/api/charts")
@Tag(name = "Chart Data API", description = "Endpoints for chart data visualization")
public class ChartController {

    private final ReportService reportService;
    private final AccountAccess access;

    public ChartController(ReportService reportService, AccountAccess access) {
        this.reportService = reportService;
        this.access = access;
    }

    @GetMapping("/portfolio-summary")
    @PreAuthorize("hasAnyRole('CUSTOMER','BANK_OFFICER','ADMIN')")
    @Operation(summary = "Get customer portfolio chart data")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Chart data retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<Map<String, Object>> getPortfolioSummary(
            @Parameter(description = "Customer ID (required for staff, ignored for customers)")
            @RequestParam(required = false) String customerId,
            Authentication auth) {
        
        ReportData data;
        if (AccountAccess.isStaff(auth)) {
            if (customerId == null || customerId.isBlank()) {
                throw new IllegalArgumentException("customerId is required for staff");
            }
            data = reportService.portfolioForCustomer(customerId);
        } else {
            data = reportService.portfolioForUsername(auth.getName());
        }

        return ResponseEntity.ok(transformToChartData(data));
    }

    @GetMapping("/fd-summary/{status}")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    @Operation(summary = "Get FD summary chart data by status")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Chart data retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<Map<String, Object>> getFdSummary(
            @Parameter(description = "FD status (ACTIVE, MATURED, PREMATURELY_CLOSED)")
            @PathVariable String status) {
        
        ReportData data = reportService.fdSummary(status.toUpperCase());
        return ResponseEntity.ok(transformToChartData(data));
    }

    @GetMapping("/maturity-timeline")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    @Operation(summary = "Get maturity timeline chart data")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Chart data retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<Map<String, Object>> getMaturityTimeline(
            @Parameter(description = "Days to look ahead (default: 30)")
            @RequestParam(defaultValue = "30") int days) {
        
        ReportData data = reportService.maturitySummary(days);
        return ResponseEntity.ok(transformToChartData(data));
    }

    @GetMapping("/interest-history/{fdAccountNo}")
    @PreAuthorize("hasAnyRole('CUSTOMER','BANK_OFFICER','ADMIN')")
    @Operation(summary = "Get interest history chart data for an FD")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Chart data retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden"),
        @ApiResponse(responseCode = "404", description = "FD account not found")
    })
    public ResponseEntity<Map<String, Object>> getInterestHistory(
            @Parameter(description = "FD account number")
            @PathVariable String fdAccountNo,
            Authentication auth) {
        
        access.requireAccess(auth, fdAccountNo);
        if (!reportService.accountExists(fdAccountNo)) {
            throw new IllegalArgumentException("Unknown FD account " + fdAccountNo);
        }
        
        ReportData data = reportService.interestHistory(fdAccountNo);
        return ResponseEntity.ok(transformToChartData(data));
    }

    @GetMapping("/portfolio-distribution")
    @PreAuthorize("hasAnyRole('CUSTOMER','BANK_OFFICER','ADMIN')")
    @Operation(summary = "Get portfolio distribution by product and currency")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Chart data retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<Map<String, Object>> getPortfolioDistribution(
            @Parameter(description = "Customer ID (required for staff, ignored for customers)")
            @RequestParam(required = false) String customerId,
            Authentication auth) {
        
        ReportData data;
        if (AccountAccess.isStaff(auth)) {
            if (customerId == null || customerId.isBlank()) {
                throw new IllegalArgumentException("customerId is required for staff");
            }
            data = reportService.portfolioForCustomer(customerId);
        } else {
            data = reportService.portfolioForUsername(auth.getName());
        }

        return ResponseEntity.ok(transformToDistributionData(data));
    }

    /**
     * Transform ReportData to chart-friendly JSON format
     */
    private Map<String, Object> transformToChartData(ReportData data) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("title", data.title());
        result.put("columns", data.columns());
        result.put("data", data.rows());
        result.put("rowCount", data.rows().size());
        return result;
    }

    /**
     * Transform ReportData to distribution chart format (pie/donut chart friendly)
     */
    private Map<String, Object> transformToDistributionData(ReportData data) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("title", data.title());
        
        // Group by product code and currency, summing principals
        Map<String, Map<String, Object>> byProduct = new LinkedHashMap<>();
        for (Map<String, Object> row : data.rows()) {
            String product = String.valueOf(row.get("product_code"));
            String currency = String.valueOf(row.get("currency"));
            Object principal = row.get("principal_amount");
            
            byProduct.computeIfAbsent(product, k -> new LinkedHashMap<>())
                .merge(currency, principal, (old, val) -> {
                    if (old instanceof Number && val instanceof Number) {
                        return ((Number) old).doubleValue() + ((Number) val).doubleValue();
                    }
                    return val;
                });
        }
        
        result.put("distribution", byProduct);
        result.put("totalAccounts", data.rows().size());
        
        // Calculate totals per currency
        Map<String, Object> totals = new LinkedHashMap<>();
        for (Map<String, Object> row : data.rows()) {
            String currency = String.valueOf(row.get("currency"));
            Object principal = row.get("principal_amount");
            totals.merge(currency, principal, (old, val) -> {
                if (old instanceof Number && val instanceof Number) {
                    return ((Number) old).doubleValue() + ((Number) val).doubleValue();
                }
                return val;
            });
        }
        result.put("totalsByCurrency", totals);
        
        return result;
    }
}
