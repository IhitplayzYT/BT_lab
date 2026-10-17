package com.bank.fdcalculator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChargeItemDTO {
    private String chargeType;
    private String chargeCategory;
    private String description;
    private BigDecimal chargeAmount;
    private String chargeUnit; // FLAT or PERCENTAGE
    private BigDecimal chargeRate;
    private Boolean isDeductible;
}
