package com.bank.product.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "productCharges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ProductCharge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chargeId")
    private Integer chargeId;

    @Column(name = "chargeType", nullable = false, length = 30)
    private String chargeType;

    @Column(name = "chargeValue", nullable = false, precision = 18, scale = 2)
    private java.math.BigDecimal chargeValue;

    @Column(name = "chargeUnit", nullable = false, length = 10)
    private String chargeUnit;

    @Column(name = "feeType", length = 30)
    private String feeType;
}
