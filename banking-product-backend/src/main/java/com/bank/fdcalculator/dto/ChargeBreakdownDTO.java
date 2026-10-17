package com.bank.fdcalculator.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
public class ChargeBreakdownDTO {
    private BigDecimal grossInterest;
    private BigDecimal netInterest;
    private BigDecimal totalDeductions;
    private List<ChargeItemDTO> charges;
    private BigDecimal maturityAmount;
    private Double effectiveRate;
    private String currency;
    private Boolean isConverted;
    private Double conversionRate;

    public ChargeBreakdownDTO(BigDecimal grossInterest, BigDecimal netInterest, BigDecimal totalDeductions,
                               List<ChargeItemDTO> charges, BigDecimal maturityAmount, Double effectiveRate,
                               String currency, Boolean isConverted, Double conversionRate) {
        this.grossInterest = grossInterest;
        this.netInterest = netInterest;
        this.totalDeductions = totalDeductions;
        this.charges = charges;
        this.maturityAmount = maturityAmount;
        this.effectiveRate = effectiveRate;
        this.currency = currency;
        this.isConverted = isConverted;
        this.conversionRate = conversionRate;
    }
}
