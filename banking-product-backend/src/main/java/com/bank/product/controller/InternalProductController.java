package com.bank.product.controller;

import com.bank.product.dto.CalculatorConfigDTO;
import com.bank.product.dto.ErrorDetails;
import com.bank.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Internal controller for service-to-service communication.
 * Endpoints here are not exposed through the public API gateway.
 */
@RestController
@RequestMapping({"/internal/products", "/api/v1/products/internal/products"})
@org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN','CUSTOMER')")
@RequiredArgsConstructor
@Tag(name = "Internal Product API", description = "Internal endpoints for service-to-service communication")
public class InternalProductController {

    private final ProductService productService;

    @GetMapping("/{productCode}/calculator-config")
    @Operation(summary = "Internal: Get calculator configuration for FD Calculator service",
            description = "Internal endpoint for FD Calculator service to fetch product configuration. Requires valid JWT for service-to-service communication.")
    @ApiResponse(responseCode = "200", description = "Calculator config returned",
            content = @Content(schema = @Schema(implementation = CalculatorConfigDTO.class)))
    @ApiResponse(responseCode = "401", description = "Missing or invalid JWT")
    @ApiResponse(responseCode = "404", description = "Product not found or inactive",
            content = @Content(schema = @Schema(implementation = ErrorDetails.class)))
    public ResponseEntity<CalculatorConfigDTO> getCalculatorConfig(
            @Parameter(description = "Unique product code") @PathVariable String productCode) {
        CalculatorConfigDTO response = productService.getCalculatorConfig(productCode);
        return ResponseEntity.ok(response);
    }
}
