package com.bank.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductChargeDTO {
    private String chargeType;
    private Double chargeValue;
    private String chargeUnit;
    private String feeType;
}
