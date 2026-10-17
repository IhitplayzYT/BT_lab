package com.bank.product.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RateCalculationRequestDTO {

    @NotNull(message = "termMonths is mandatory")
    @Positive(message = "termMonths must be positive")
    private Integer termMonths;

    private String customerCategory;

    private Integer age;

    @Positive
    private Double amount;
}
