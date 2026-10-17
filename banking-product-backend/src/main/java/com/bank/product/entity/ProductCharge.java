package com.bank.product.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_charges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ProductCharge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "charge_id")
    private Integer chargeId;

    @Column(name = "charge_type", nullable = false, length = 30)
    private String chargeType;

    @Column(name = "charge_value", nullable = false)
    private Double chargeValue;

    @Column(name = "charge_unit", nullable = false, length = 10)
    private String chargeUnit;

    @Column(name = "fee_type", length = 30)
    private String feeType;

    @Column(name = "interest_credit_frequency")
    private String interestCreditFrequency;
}
