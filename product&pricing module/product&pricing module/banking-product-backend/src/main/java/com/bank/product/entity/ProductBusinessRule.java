package com.bank.product.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "productBusinessRules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ProductBusinessRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ruleId")
    private Integer ruleId;

    @Column(name = "termLimitMin", nullable = false)
    private Integer termLimitMin;

    @Column(name = "termLimitMax", nullable = false)
    private Integer termLimitMax;

    @Column(name = "rateLimitMin", nullable = false, precision = 6, scale = 2)
    private java.math.BigDecimal rateLimitMin;

    @Column(name = "rateLimitMax", nullable = false, precision = 6, scale = 2)
    private java.math.BigDecimal rateLimitMax;

    @Column(name = "transactionType")
    private String transactionType;
}
