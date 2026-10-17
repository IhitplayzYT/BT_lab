package com.bank.fdcalculator.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FdTermDTO {
    
    @NotNull(message = "Term value is mandatory")
    @Min(value = 1, message = "Term value must be greater than zero")
    private Integer value;

    @NotBlank(message = "Term unit is mandatory (e.g. months, years)")
    private String unit;
}
