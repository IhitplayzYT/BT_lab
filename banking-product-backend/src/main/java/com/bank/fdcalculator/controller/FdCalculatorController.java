package com.bank.fdcalculator.controller;

import com.bank.fdcalculator.dto.AdvancedCalculationRequestDTO;
import com.bank.fdcalculator.dto.CategoryRateDTO;
import com.bank.fdcalculator.dto.ChargeBreakdownDTO;
import com.bank.fdcalculator.dto.FdCalculationRequestDTO;
import com.bank.fdcalculator.dto.FdCalculationResponseDTO;
import com.bank.fdcalculator.entity.FdCalculation;
import com.bank.fdcalculator.service.FdCalculatorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fd")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
@RequiredArgsConstructor
@Tag(name = "FD Calculator API", description = "Endpoints for computing Fixed Deposit maturity interest amounts and listing rate variation categories.")
public class FdCalculatorController {

    private final FdCalculatorService fdCalculatorService;

    @PostMapping("/calculate")
    @Operation(summary = "Calculate FD maturity and interest details", description = "Calculates total interest earned and total maturity amount from principal, rates, terms and selected customer categories.")
    @ApiResponse(responseCode = "200", description = "FD calculations completed successfully",
            content = @Content(schema = @Schema(implementation = FdCalculationResponseDTO.class)))
    @ApiResponse(responseCode = "400", description = "Invalid calculation inputs or unknown customer categories")
    public ResponseEntity<FdCalculationResponseDTO> calculateFd(@Valid @RequestBody FdCalculationRequestDTO request) {
        FdCalculationResponseDTO response = fdCalculatorService.calculateMaturity(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/calculate/advanced")
    @Operation(summary = "Calculate FD maturity with detailed charge breakdown", description = "Calculates maturity amount with category-wise charge breakdown including tax, service fees, documentation, penalties, and GST.")
    @ApiResponse(responseCode = "200", description = "Advanced FD calculations completed successfully",
            content = @Content(schema = @Schema(implementation = ChargeBreakdownDTO.class)))
    @ApiResponse(responseCode = "400", description = "Invalid calculation inputs or unknown customer categories")
    public ResponseEntity<ChargeBreakdownDTO> calculateAdvancedFd(@Valid @RequestBody AdvancedCalculationRequestDTO request) {
        ChargeBreakdownDTO response = fdCalculatorService.calculateAdvancedMaturity(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/categories")
    @Operation(summary = "Get available customer category rate modifiers", description = "Returns the available list of categories, their customer titles and default rate modifiers.")
    @ApiResponse(responseCode = "200", description = "Categories lookup completed successfully",
            content = @Content(schema = @Schema(implementation = CategoryRateDTO.class)))
    public ResponseEntity<List<CategoryRateDTO>> getCategories() {
        List<CategoryRateDTO> response = fdCalculatorService.getAvailableCategories();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    @Operation(summary = "Get Fixed Deposit calculations history log", description = "Retrieves the historical list of all computed Fixed Deposit calculations sorted by date descending.")
    @ApiResponse(responseCode = "200", description = "History log retrieved successfully",
            content = @Content(schema = @Schema(implementation = FdCalculation.class)))
    public ResponseEntity<List<FdCalculation>> getHistory() {
        List<FdCalculation> response = fdCalculatorService.getCalculationHistory();
        return ResponseEntity.ok(response);
    }
}
