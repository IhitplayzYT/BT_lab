package com.bank.product.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_business_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ProductBusinessRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rule_id")
    private Integer ruleId;

    @Column(name = "term_limit_min", nullable = false)
    private Integer termLimitMin;

    @Column(name = "term_limit_max", nullable = false)
    private Integer termLimitMax;

    @Column(name = "rate_limit_min", nullable = false)
    private Double rateLimitMin;

    @Column(name = "rate_limit_max", nullable = false)
    private Double rateLimitMax;

    @Column(name = "transaction_type")
    private String transactionType;
}
