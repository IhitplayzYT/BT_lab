package com.bank.fdcalculator.service;

import com.bank.fdcalculator.dto.AdvancedCalculationRequestDTO;
import com.bank.fdcalculator.dto.CategoryRateDTO;
import com.bank.fdcalculator.dto.ChargeBreakdownDTO;
import com.bank.fdcalculator.dto.FdCalculationRequestDTO;
import com.bank.fdcalculator.dto.FdCalculationResponseDTO;

import java.util.List;

public interface FdCalculatorService {
    FdCalculationResponseDTO calculateMaturity(FdCalculationRequestDTO dto);
    ChargeBreakdownDTO calculateAdvancedMaturity(AdvancedCalculationRequestDTO dto);
    List<CategoryRateDTO> getAvailableCategories();
    List<com.bank.fdcalculator.entity.FdCalculation> getCalculationHistory();
}
