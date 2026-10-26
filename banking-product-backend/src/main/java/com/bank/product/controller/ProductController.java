package com.bank.product.controller;

import com.bank.product.dto.*;
import com.bank.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping({"/api/product", "/api/v1/products"})
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
@RequiredArgsConstructor
@Tag(name = "Banking Product API", description = "Endpoints for creating, maintaining, and integrating banking products (FD, CASA, Loans).")
@SecurityRequirement(name = "BearerAuthentication")
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    @Operation(summary = "Create a new banking product", description = "Requires BANK_OFFICER or ADMIN role. Creates a banking product with term, rate, charges, allowed roles and variations.")
    @ApiResponse(responseCode = "201", description = "Product created successfully",
            content = @Content(schema = @Schema(implementation = ProductResponseDTO.class)))
    @ApiResponse(responseCode = "400", description = "Invalid product request details",
            content = @Content(schema = @Schema(implementation = ErrorDetails.class)))
    @ApiResponse(responseCode = "401", description = "Unauthenticated request",
            content = @Content(schema = @Schema(implementation = ErrorDetails.class)))
    @ApiResponse(responseCode = "403", description = "Unauthorized role",
            content = @Content(schema = @Schema(implementation = ErrorDetails.class)))
    @ApiResponse(responseCode = "409", description = "Duplicate product code error",
            content = @Content(schema = @Schema(implementation = ErrorDetails.class)))
    public ResponseEntity<ProductResponseDTO> createProduct(@Valid @RequestBody ProductRequestDTO request) {
        ProductResponseDTO response = productService.createProduct(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{productCode}")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    @Operation(summary = "Update an existing banking product", description = "Requires BANK_OFFICER or ADMIN role. Updates product specifications.")
    @ApiResponse(responseCode = "200", description = "Product updated successfully",
            content = @Content(schema = @Schema(implementation = ProductResponseDTO.class)))
    @ApiResponse(responseCode = "400", description = "Invalid update parameters",
            content = @Content(schema = @Schema(implementation = ErrorDetails.class)))
    @ApiResponse(responseCode = "401", description = "Unauthenticated request",
            content = @Content(schema = @Schema(implementation = ErrorDetails.class)))
    @ApiResponse(responseCode = "403", description = "Unauthorized role",
            content = @Content(schema = @Schema(implementation = ErrorDetails.class)))
    @ApiResponse(responseCode = "404", description = "Product not found",
            content = @Content(schema = @Schema(implementation = ErrorDetails.class)))
    public ResponseEntity<ProductResponseDTO> updateProduct(
            @Parameter(description = "Unique code of the product to update") @PathVariable String productCode,
            @Valid @RequestBody ProductRequestDTO request) {
        ProductResponseDTO response = productService.updateProduct(productCode, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{productCode}")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    @Operation(summary = "Retire / Soft-delete a product", description = "Requires BANK_OFFICER or ADMIN role. Transitions product lifecycle status to RETIRED without hard-deleting.")
    @ApiResponse(responseCode = "200", description = "Product retired successfully")
    @ApiResponse(responseCode = "404", description = "Product not found")
    public ResponseEntity<ProductResponseDTO> retireProduct(
            @Parameter(description = "Unique code of the product to retire") @PathVariable String productCode) {
        ProductResponseDTO response = productService.retireProduct(productCode);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{productCode}/permanent")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Permanently delete a product", description = "Requires ADMIN role only. Hard-deletes the product from the database. This action cannot be undone.")
    @ApiResponse(responseCode = "200", description = "Product permanently deleted successfully")
    @ApiResponse(responseCode = "404", description = "Product not found")
    public ResponseEntity<Void> permanentlyDeleteProduct(
            @Parameter(description = "Unique code of the product to permanently delete") @PathVariable String productCode) {
        productService.permanentlyDeleteProduct(productCode);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN','CUSTOMER')")
    @Operation(summary = "Search products by filters", description = "Requires BANK_OFFICER or ADMIN role. Retrieves products filtered by product type, status, and effective date range with pagination.")
    @ApiResponse(responseCode = "200", description = "Successful retrieval of products",
            content = @Content(schema = @Schema(implementation = ProductResponseDTO.class)))
    public ResponseEntity<List<ProductResponseDTO>> searchProducts(
            @Parameter(description = "Type of product (e.g. FD, SAVINGS, LOAN)") @RequestParam(required = false) String productType,
            @Parameter(description = "Start effective date for filtering (yyyy-MM-dd)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End effective date for filtering (yyyy-MM-dd)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Status of product (ACTIVE, INACTIVE, DRAFT, SUSPENDED, RETIRED)") @RequestParam(required = false) String status,
            @Parameter(description = "Zero-based page index") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "50") int size,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "productId") String sortBy) {
        List<ProductResponseDTO> response = productService.searchProducts(productType, startDate, endDate, status, page, size, sortBy);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    @Operation(summary = "List active products", description = "Feeds the FD creation form's product dropdown by product type. Public endpoint - no authentication required.")
    @ApiResponse(responseCode = "200", description = "Active products returned",
            content = @Content(schema = @Schema(implementation = ProductResponseDTO.class)))
    public ResponseEntity<List<ProductResponseDTO>> getActiveProducts(
            @Parameter(description = "Filter by product type (e.g. FD)") @RequestParam(required = false) String type) {
        List<ProductResponseDTO> response = productService.getActiveProducts(type);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{productCode}")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN','CUSTOMER')")
    @Operation(summary = "Get a banking product by its unique code", description = "Requires BANK_OFFICER or ADMIN role. Retrieves complete specifications of a banking product.")
    @ApiResponse(responseCode = "200", description = "Product found and returned",
            content = @Content(schema = @Schema(implementation = ProductResponseDTO.class)))
    @ApiResponse(responseCode = "404", description = "Product not found",
            content = @Content(schema = @Schema(implementation = ErrorDetails.class)))
    public ResponseEntity<ProductResponseDTO> getProductByCode(
            @Parameter(description = "Unique code of the product to fetch") @PathVariable String productCode) {
        ProductResponseDTO response = productService.getProductByCode(productCode);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{productCode}/validate")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN','CUSTOMER')")
    @Operation(summary = "Validate product configuration for account creation (FD Lab L13)",
            description = "Validates that product exists, is ACTIVE, within effective dates, and conforms to term, deposit amount, and minimum age limits.")
    @ApiResponse(responseCode = "200", description = "Product criteria validation passed",
            content = @Content(schema = @Schema(implementation = ProductValidationResponseDTO.class)))
    @ApiResponse(responseCode = "400", description = "Validation criteria failed (term, amount, or age out of bounds)",
            content = @Content(schema = @Schema(implementation = ErrorDetails.class)))
    @ApiResponse(responseCode = "404", description = "Product not found",
            content = @Content(schema = @Schema(implementation = ErrorDetails.class)))
    @ApiResponse(responseCode = "422", description = "Product is inactive, not effective, or expired",
            content = @Content(schema = @Schema(implementation = ErrorDetails.class)))
    public ResponseEntity<ProductValidationResponseDTO> validateProduct(
            @Parameter(description = "Unique product code") @PathVariable String productCode,
            @Parameter(description = "Requested FD term in months") @RequestParam(required = false) Integer termMonths,
            @Parameter(description = "Requested deposit amount") @RequestParam(required = false) Double amount,
            @Parameter(description = "Customer age in years") @RequestParam(required = false) Integer age) {
        ProductValidationResponseDTO response = productService.validateProduct(productCode, termMonths, amount, age);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{productCode}/rate")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN','CUSTOMER')")
    @Operation(summary = "Determine final interest rate (FD Lab L13)",
            description = "Calculates base rate for term plus category adjustment (Senior Citizen, Employee), clamped within product min/max rate.")
    @ApiResponse(responseCode = "200", description = "Final interest rate calculated successfully",
            content = @Content(schema = @Schema(implementation = RateCalculationResponseDTO.class)))
    @ApiResponse(responseCode = "400", description = "Invalid calculation parameters",
            content = @Content(schema = @Schema(implementation = ErrorDetails.class)))
    @ApiResponse(responseCode = "404", description = "Product not found",
            content = @Content(schema = @Schema(implementation = ErrorDetails.class)))
    @ApiResponse(responseCode = "422", description = "Product is inactive",
            content = @Content(schema = @Schema(implementation = ErrorDetails.class)))
    public ResponseEntity<RateCalculationResponseDTO> calculateRate(
            @Parameter(description = "Unique product code") @PathVariable String productCode,
            @Valid @RequestBody RateCalculationRequestDTO request) {
        RateCalculationResponseDTO response = productService.calculateFinalRate(productCode, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{productCode}/defaults")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN','CUSTOMER')")
    @Operation(summary = "Get product defaults for account creation (FD Lab L13)",
            description = "Provides default values to copy onto an account (term, amount, charges, roles).")
    @ApiResponse(responseCode = "200", description = "Product defaults returned",
            content = @Content(schema = @Schema(implementation = ProductDefaultsResponseDTO.class)))
    @ApiResponse(responseCode = "404", description = "Product not found",
            content = @Content(schema = @Schema(implementation = ErrorDetails.class)))
    public ResponseEntity<ProductDefaultsResponseDTO> getProductDefaults(
            @Parameter(description = "Unique product code") @PathVariable String productCode) {
        ProductDefaultsResponseDTO response = productService.getProductDefaults(productCode);
        return ResponseEntity.ok(response);
    }
}
