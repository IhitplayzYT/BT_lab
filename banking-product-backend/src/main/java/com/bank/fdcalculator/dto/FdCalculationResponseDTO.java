package com.bank.fdcalculator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FdCalculationResponseDTO {
    private BigDecimal maturityAmount;
    private Double effectiveRate;
    private BigDecimal interestEarned;
    private String currency;
    private Boolean isConverted;
    private Double conversionRate;

    public FdCalculationResponseDTO(BigDecimal maturityAmount, Double effectiveRate, BigDecimal interestEarned) {
        this.maturityAmount = maturityAmount;
        this.effectiveRate = effectiveRate;
        this.interestEarned = interestEarned;
        this.currency = "INR";
        this.isConverted = false;
        this.conversionRate = null;
    }

    public FdCalculationResponseDTO(BigDecimal maturityAmount, Double effectiveRate, BigDecimal interestEarned, String currency) {
        this.maturityAmount = maturityAmount;
        this.effectiveRate = effectiveRate;
        this.interestEarned = interestEarned;
        this.currency = currency;
        this.isConverted = false;
        this.conversionRate = null;
    }
}
