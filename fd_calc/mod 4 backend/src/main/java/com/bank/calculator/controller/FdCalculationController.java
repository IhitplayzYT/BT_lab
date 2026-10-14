package com.bank.calculator.controller;

import com.bank.calculator.config.OpenApiConfig;
import com.bank.calculator.dto.BatchCalculationRequest;
import com.bank.calculator.dto.BatchCalculationResponse;
import com.bank.calculator.dto.request.CalculationRequest;
import com.bank.calculator.dto.request.ComparisonRequest;
import com.bank.calculator.dto.request.CustomCalculationRequest;
import com.bank.calculator.dto.response.CalculationResponse;
import com.bank.calculator.dto.response.ComparisonResponse;
import com.bank.calculator.dto.response.ErrorResponse;
import com.bank.calculator.dto.response.ProductPreviewResponse;
import com.bank.calculator.exception.CalculationNotFoundException;
import com.bank.calculator.model.CalculationAudit;
import com.bank.calculator.repository.CalculationAuditRepository;
import com.bank.calculator.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for the FD Calculator public API.
 *
 * <p>All endpoints under {@code /api/v1/fd/} require a valid JWT with
 * the {@code CUSTOMER} role (enforced by {@link com.bank.calculator.config.SecurityConfig}).
 *
 * <p>No calculation logic lives in this class — all business logic is
 * delegated to {@link FdCalculatorService}.
 */
@RestController
@RequestMapping("/api/v1/fd")
@Tag(name = "FD Calculator", description = "Simulation-only Fixed Deposit maturity estimation endpoints. CUSTOMER role required.")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class FdCalculationController {

    private final FdCalculatorService calculatorService;
    private final ExplainService explainService;
    private final ExportService exportService;
    private final CalculationAuditRepository auditRepository;
    private final com.bank.calculator.service.ProductCatalogService productCatalogService;
    private final com.bank.calculator.service.AuditService auditService;

    public FdCalculationController(FdCalculatorService calculatorService,
                                   ExplainService explainService,
                                   ExportService exportService,
                                   CalculationAuditRepository auditRepository) {
        this(calculatorService, explainService, exportService, auditRepository, null, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public FdCalculationController(FdCalculatorService calculatorService,
                                   ExplainService explainService,
                                   ExportService exportService,
                                   CalculationAuditRepository auditRepository,
                                   @org.springframework.beans.factory.annotation.Autowired(required = false)
                                   com.bank.calculator.service.ProductCatalogService productCatalogService,
                                   @org.springframework.beans.factory.annotation.Autowired(required = false)
                                   com.bank.calculator.service.AuditService auditService) {
        this.calculatorService = calculatorService;
        this.explainService = explainService;
        this.exportService = exportService;
        this.auditRepository = auditRepository;
        this.productCatalogService = productCatalogService;
        this.auditService = auditService;
    }

    // ─── POST /api/v1/fd/calculations ─────────────────────────────────────

    @PostMapping("/calculations")
    @Operation(
        summary = "Calculate FD maturity estimate",
        description = """
            Calculates a simulation-only FD maturity estimate for the authenticated customer.
            
            The principal, term and product code are taken from the request.
            Rates and customer categories are fetched from authoritative internal services —
            any rate or category supplied in the request body is ignored.
            """)
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Calculation successful",
            content = @Content(schema = @Schema(implementation = CalculationResponse.class))),
        @ApiResponse(responseCode = "400", description = "Malformed request or validation error",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Authenticated user lacks CUSTOMER role",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Product not found",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "422", description = "Invalid term, inactive product, or unsupported payout mode",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "503", description = "Product or Customer Service unavailable",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Unexpected server error",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<CalculationResponse> calculate(
            @Valid @RequestBody CalculationRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(calculatorService.calculate(request, authentication));
    }

    // ─── POST /api/v1/fd/calculations/compare ─────────────────────────────

    @PostMapping("/calculations/compare")
    @Operation(
        summary = "Compare FD maturity across multiple products/terms",
        description = "Accepts one principal and 2–3 product/term options. Returns results ordered by maturity amount descending.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Comparison successful",
            content = @Content(schema = @Schema(implementation = ComparisonResponse.class))),
        @ApiResponse(responseCode = "400", description = "Validation error",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "CUSTOMER role required"),
        @ApiResponse(responseCode = "503", description = "Dependency unavailable")
    })
    public ResponseEntity<ComparisonResponse> compare(
            @Valid @RequestBody ComparisonRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(calculatorService.compare(request, authentication));
    }

    // ─── GET /api/v1/fd/calculations/{calculationId} ──────────────────────

    @GetMapping("/calculations/{calculationId}")
    @Operation(
        summary = "Retrieve a saved calculation",
        description = "Returns the saved simulation result. Enforces ownership — a customer can only retrieve their own calculations.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Calculation found",
            content = @Content(schema = @Schema(implementation = CalculationResponse.class))),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "CUSTOMER role required"),
        @ApiResponse(responseCode = "404", description = "Calculation not found or not owned by this customer",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<CalculationResponse> getCalculation(
            @Parameter(description = "Calculation ID, e.g. CALC-20260911-0001", example = "CALC-20260911-0001")
            @PathVariable String calculationId,
            Authentication authentication) {
        return ResponseEntity.ok(calculatorService.getCalculation(calculationId, authentication));
    }

    // ─── GET /api/v1/fd/calculations/uuid/{uuid} ──────────────────────────

    @GetMapping("/calculations/uuid/{uuid}")
    @Operation(
        summary = "Retrieve a saved calculation by persistent UUID",
        description = "Returns the saved simulation result by persistent UUID. Enforces ownership — a customer can only retrieve their own calculations.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Calculation found",
            content = @Content(schema = @Schema(implementation = CalculationResponse.class))),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "CUSTOMER role required"),
        @ApiResponse(responseCode = "404", description = "Calculation not found or not owned by this customer",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<CalculationResponse> getCalculationByUuid(
            @Parameter(description = "Persistent calculation UUID", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable String uuid,
            Authentication authentication) {
        return ResponseEntity.ok(calculatorService.getCalculationByUuid(uuid, authentication));
    }

    // ─── POST /api/v1/fd/cache/rates/evict ─────────────────────────────────

    @PostMapping("/cache/rates/evict")
    @Operation(
        summary = "Evict cached product rates",
        description = "Invalidates cached product rate configuration. Called on customer logout or administrative refresh.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Rate cache evicted successfully"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "CUSTOMER role required")
    })
    public ResponseEntity<Void> evictRateCache() {
        if (productCatalogService != null) {
            productCatalogService.evictAllRateCaches();
        }
        return ResponseEntity.ok().build();
    }

    // ─── GET /api/v1/fd/calculations/{calculationId}/export ───────────────

    @GetMapping("/calculations/{calculationId}/export")
    @Operation(
        summary = "Export a calculation as CSV",
        description = "Downloads the calculation as a CSV file. Only the owning customer may export their calculation.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "CSV file returned"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "CUSTOMER role required"),
        @ApiResponse(responseCode = "404", description = "Calculation not found")
    })
    public ResponseEntity<String> exportCsv(
            @PathVariable String calculationId,
            @Parameter(description = "Export format (currently only 'csv' is supported)", example = "csv")
            @RequestParam(defaultValue = "csv") String format,
            Authentication authentication) {

        if (!"csv".equalsIgnoreCase(format)) {
            throw new IllegalArgumentException("Unsupported export format: '" + format + "'. Only 'csv' is supported.");
        }

        String username = extractUsername(authentication);
        CalculationAudit audit = auditRepository
                .findByCalculationIdAndCustomerId(calculationId, username)
                .orElseThrow(() -> new CalculationNotFoundException(calculationId));

        String csv = exportService.toCsv(audit);
        String filename = "fd-calculation-" + calculationId + ".csv";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(csv);
    }

    // ─── POST /api/v1/fd/calculations/{calculationId}/explain ─────────────

    @PostMapping("/calculations/{calculationId}/explain")
    @Operation(
        summary = "Get plain-language explanation for a calculation",
        description = "Returns a deterministic template-based plain-language explanation of the stored calculation. No AI is used.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Explanation returned"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "CUSTOMER role required"),
        @ApiResponse(responseCode = "404", description = "Calculation not found")
    })
    public ResponseEntity<String> explain(
            @PathVariable String calculationId,
            Authentication authentication) {
        CalculationResponse response = calculatorService.getCalculation(calculationId, authentication);
        return ResponseEntity.ok(explainService.explain(response));
    }

    // ─── GET /api/v1/fd/products/{productCode}/preview ────────────────────

    @GetMapping("/products/{productCode}/preview")
    @Operation(
        summary = "Preview product constraints for the calculator",
        description = "Returns calculator-safe product constraints (min/max principal, term, base rate, interest type). CUSTOMER role required.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Product preview returned",
            content = @Content(schema = @Schema(implementation = ProductPreviewResponse.class))),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "CUSTOMER role required"),
        @ApiResponse(responseCode = "404", description = "Product not found"),
        @ApiResponse(responseCode = "503", description = "Product Service unavailable")
    })
    public ResponseEntity<ProductPreviewResponse> previewProduct(
            @Parameter(description = "FD product code", example = "FD001")
            @PathVariable String productCode) {
        return ResponseEntity.ok(calculatorService.previewProduct(productCode));
    }

    // ─── POST /api/v1/fd/batch/calculations ────────────────────────────────

    @PostMapping("/batch/calculations")
    @Operation(
        summary = "Batch FD maturity calculations",
        description = "Processes multiple FD calculation requests in a single call. Results are sent to Kafka for logging. CUSTOMER role required.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Batch calculations completed",
            content = @Content(schema = @Schema(implementation = BatchCalculationResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid batch request"),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT"),
        @ApiResponse(responseCode = "403", description = "CUSTOMER role required")
    })
    public ResponseEntity<BatchCalculationResponse> batchCalculate(
            @Valid @RequestBody BatchCalculationRequest batchRequest,
            Authentication authentication) {
        return ResponseEntity.ok(calculatorService.batchCalculate(batchRequest, authentication));
    }

    // ─── POST /api/v1/fd/calculations/custom ────────────────────────────────

    @PostMapping("/calculations/custom")
    @Operation(
        summary = "Calculate custom FD maturity with user-defined parameters",
        description = """
            Calculates a simulation-only FD maturity estimate with fully customizable parameters.
            Accepts custom interest rate, interest type, and compounding frequency.
            Bypasses Product Service validation. CUSTOMER role required.
            """)
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Custom calculation successful",
            content = @Content(schema = @Schema(implementation = CalculationResponse.class))),
        @ApiResponse(responseCode = "400", description = "Malformed request or validation error",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "Missing or invalid JWT",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "Authenticated user lacks CUSTOMER role",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "Unexpected server error",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<CalculationResponse> calculateCustom(
            @Valid @RequestBody CustomCalculationRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(calculatorService.calculateCustom(request, authentication));
    }

    // ── Helper ─────────────────────────────────────────────────────────────

    private String extractUsername(Authentication authentication) {
        if (authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt.getSubject();
        }
        return authentication.getName();
    }
}
