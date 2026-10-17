package com.bank.product.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Embeddable
public class RateVariation {

    @Column(name = "customer_category", nullable = false)
    private String customerCategory;

    @Column(name = "rate_modifier", nullable = false)
    private Double rateModifier;
}
