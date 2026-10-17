package com.bank.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChargesDTO {
    private String interestCreditFrequency;
    private Boolean taxDeduction;
    private Double withdrawalFees;
}
