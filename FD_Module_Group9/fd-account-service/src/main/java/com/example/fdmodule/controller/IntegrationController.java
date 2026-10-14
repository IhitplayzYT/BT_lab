package com.example.fdmodule.controller;

import com.example.fdmodule.client.CalculatorServiceClient;
import com.example.fdmodule.client.ProductServiceClient;
import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Integration controller for calling external services (Product & Pricing, FD Calculator).
 * Provides endpoints that proxy requests to other microservices in the platform.
 */
@RestController
@RequestMapping("/api/v1/integration")
@Tag(name = "Service Integration", description = "Endpoints for integrating with Product & Pricing and FD Calculator services")
public class IntegrationController {

    private final ProductServiceClient productServiceClient;
    private final CalculatorServiceClient calculatorServiceClient;

    public IntegrationController(ProductServiceClient productServiceClient,
                                CalculatorServiceClient calculatorServiceClient) {
        this.productServiceClient = productServiceClient;
        this.calculatorServiceClient = calculatorServiceClient;
    }

    // ─── Product Service Integration ───────────────────────────────────────

    @GetMapping("/products/active")
    @PreAuthorize("hasAnyRole('BANK_OFFICER', 'ADMIN')")
    @Operation(summary = "Get active products from Product & Pricing service",
            description = "Retrieves active products from the Product & Pricing microservice")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Products retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "503", description = "Product Service unavailable")
    })
    public ResponseEntity<List<JsonNode>> getActiveProducts(
            @Parameter(description = "Filter by product type (e.g. FD)")
            @RequestParam(required = false) String type) {
        List<JsonNode> products = productServiceClient.getActiveProducts(type);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/{productCode}")
    @PreAuthorize("hasAnyRole('BANK_OFFICER', 'ADMIN')")
    @Operation(summary = "Get product by code from Product & Pricing service",
            description = "Retrieves a specific product from the Product & Pricing microservice")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Product not found"),
            @ApiResponse(responseCode = "503", description = "Product Service unavailable")
    })
    public ResponseEntity<JsonNode> getProductByCode(
            @Parameter(description = "Product code")
            @PathVariable String productCode) {
        JsonNode product = productServiceClient.getProductByCode(productCode);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/products/{productCode}/validate")
    @PreAuthorize("hasAnyRole('BANK_OFFICER', 'ADMIN')")
    @Operation(summary = "Validate product for account creation",
            description = "Validates product configuration against Product & Pricing service")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Validation completed"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "503", description = "Product Service unavailable")
    })
    public ResponseEntity<JsonNode> validateProduct(
            @Parameter(description = "Product code")
            @PathVariable String productCode,
            @Parameter(description = "Term in months")
            @RequestParam(required = false) Integer termMonths,
            @Parameter(description = "Deposit amount")
            @RequestParam(required = false) Double amount,
            @Parameter(description = "Customer age")
            @RequestParam(required = false) Integer age) {
        JsonNode validation = productServiceClient.validateProduct(productCode, termMonths, amount, age);
        return ResponseEntity.ok(validation);
    }

    // ─── Calculator Service Integration ───────────────────────────────────

    @PostMapping("/calculator/calculate")
    @PreAuthorize("hasAnyRole('BANK_OFFICER', 'ADMIN', 'CUSTOMER')")
    @Operation(summary = "Calculate FD maturity using Calculator service",
            description = "Calculates FD maturity estimate using the FD Calculator microservice")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Calculation completed"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "503", description = "Calculator Service unavailable")
    })
    public ResponseEntity<JsonNode> calculateMaturity(
            @Parameter(description = "Product code")
            @RequestParam String productCode,
            @Parameter(description = "Principal amount")
            @RequestParam Double principal,
            @Parameter(description = "Term in months")
            @RequestParam Integer termMonths,
            @Parameter(description = "Interest type (CREDIT, SIMPLE, COMPOUND)")
            @RequestParam(required = false) String interestType) {
        JsonNode result = calculatorServiceClient.calculateMaturity(productCode, principal, termMonths, interestType);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/calculator/products/{productCode}/preview")
    @PreAuthorize("hasAnyRole('BANK_OFFICER', 'ADMIN', 'CUSTOMER')")
    @Operation(summary = "Preview product constraints from Calculator service",
            description = "Retrieves calculator-safe product constraints from FD Calculator microservice")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product preview retrieved"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Product not found"),
            @ApiResponse(responseCode = "503", description = "Calculator Service unavailable")
    })
    public ResponseEntity<JsonNode> previewProduct(
            @Parameter(description = "Product code")
            @PathVariable String productCode) {
        JsonNode preview = calculatorServiceClient.previewProduct(productCode);
        return ResponseEntity.ok(preview);
    }
}
