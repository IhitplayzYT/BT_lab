package com.bank.fdcalculator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRateDTO {
    private String categoryCode;
    private String categoryName;
    private Double additionalPercent;
}
