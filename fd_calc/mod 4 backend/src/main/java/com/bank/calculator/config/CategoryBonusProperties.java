package com.bank.calculator.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Configurable bonus amounts for each recognised customer category.
 * Bound from {@code calculator.category-bonus.*} in application.yml.
 *
 * <p>Example YAML:
 * <pre>
 * calculator:
 *   category-bonus:
 *     bonuses:
 *       SENIOR_CITIZEN: 1.00
 *       EMPLOYEE: 0.50
 *       PREMIUM: 1.00
 *     max-total-bonus: 2.00
 * </pre>
 */
@Validated
@ConfigurationProperties(prefix = "calculator.category-bonus")
public class CategoryBonusProperties {

    /**
     * Map of category name → bonus percentage.
     * Keys must match {@link com.bank.calculator.model.enums.CustomerCategory} names.
     */
    @NotNull
    private Map<String, BigDecimal> bonuses = new LinkedHashMap<>();

    /** Maximum combined category bonus that can be applied. Default 2.00 %. */
    @NotNull
    @DecimalMin(value = "0.00")
    private BigDecimal maxTotalBonus = new BigDecimal("2.00");

    public CategoryBonusProperties() {
    }

    public Map<String, BigDecimal> getBonuses() {
        return bonuses;
    }

    public void setBonuses(Map<String, BigDecimal> bonuses) {
        this.bonuses = bonuses;
    }

    public BigDecimal getMaxTotalBonus() {
        return maxTotalBonus;
    }

    public void setMaxTotalBonus(BigDecimal maxTotalBonus) {
        this.maxTotalBonus = maxTotalBonus;
    }
}
