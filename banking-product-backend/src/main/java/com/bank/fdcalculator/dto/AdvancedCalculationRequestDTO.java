package com.bank.fdcalculator.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class AdvancedCalculationRequestDTO {

    @NotNull(message = "Principal amount is mandatory")
    @DecimalMin(value = "0.01", message = "Principal amount must be greater than zero")
    private BigDecimal principal;

    @NotNull(message = "Term specifications are mandatory")
    @Valid
    private FdTermDTO term;

    private Double baseRate;

    @NotNull(message = "Product code is mandatory for advanced calculations")
    private String productCode;

    private List<String> categories = new ArrayList<>();

    @NotNull(message = "Interest type is mandatory (SIMPLE or COMPOUND)")
    private String interestType;

    private String currency;

    private Integer compoundingFrequency;

    private Integer age;

    private Boolean includePrematureWithdrawal;
    private Integer prematureWithdrawalMonths;

    public AdvancedCalculationRequestDTO() {
        this.categories = new ArrayList<>();
    }
}
