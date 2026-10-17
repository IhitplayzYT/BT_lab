package com.bank.fdcalculator.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FdCalculationRequestDTO {

    @NotNull(message = "Principal amount is mandatory")
    @DecimalMin(value = "0.01", message = "Principal amount must be greater than zero")
    private BigDecimal principal;

    @NotNull(message = "Term specifications are mandatory")
    @Valid
    private FdTermDTO term;

    private Double baseRate;

    private String productCode;

    private List<String> categories = new ArrayList<>();

    @NotBlank(message = "Interest type is mandatory (SIMPLE or COMPOUND)")
    private String interestType;

    private String currency;

    private Integer compoundingFrequency; // e.g. 1 for annual, 4 for quarterly, 12 for monthly

    public FdCalculationRequestDTO(BigDecimal principal, FdTermDTO term, Double baseRate, String productCode, List<String> categories, String interestType, Integer compoundingFrequency) {
        this.principal = principal;
        this.term = term;
        this.baseRate = baseRate;
        this.productCode = productCode;
        this.categories = categories;
        this.interestType = interestType;
        this.compoundingFrequency = compoundingFrequency;
        this.currency = "INR";
    }
}
