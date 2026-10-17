package com.bank.product.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class ProductCharges {

    @Column(name = "interest_credit_frequency")
    private String interestCreditFrequency;

    @Column(name = "tax_deduction")
    private Boolean taxDeduction;

    @Column(name = "withdrawal_fees")
    private Double withdrawalFees;
}
