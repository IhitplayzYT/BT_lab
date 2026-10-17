package com.bank.calculator.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;

/**
 * Client-side DTO for the Product/Pricing Service calculator-config response.
 *
 * <p>This class mirrors the external API contract exactly. When the Product
 * Service changes its schema, only this class (and its mapper) needs updating.
 * No downstream business logic is affected.
 *
 * <p>Uses {@code @JsonIgnoreProperties(ignoreUnknown = true)} so that new
 * fields added by the Product Service do not break this service.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductConfigDto {

    private java.util.Map<String, BigDecimal> categoryBonuses;
    public java.util.Map<String, BigDecimal> getCategoryBonuses() { return categoryBonuses; }
    public void setCategoryBonuses(java.util.Map<String, BigDecimal> value) { categoryBonuses = value; }
    private String productCode;
    private String productName;
    private String productType;
    private String status;
    private String currency;
    private BigDecimal minPrincipal;
    private BigDecimal maxPrincipal;
    private TermLimit termLimit;
    private RateLimit rateLimit;
    private BigDecimal baseRate;
    private String interestType;
    private String compoundingFrequency;
    private boolean supportsPeriodicPayout;

    public ProductConfigDto() {
    }

    public String getProductCode() {
        return productCode;
    }

    public void setProductCode(String productCode) {
        this.productCode = productCode;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductType() {
        return productType;
    }

    public void setProductType(String productType) {
        this.productType = productType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public BigDecimal getMinPrincipal() {
        return minPrincipal;
    }

    public void setMinPrincipal(BigDecimal minPrincipal) {
        this.minPrincipal = minPrincipal;
    }

    public BigDecimal getMaxPrincipal() {
        return maxPrincipal;
    }

    public void setMaxPrincipal(BigDecimal maxPrincipal) {
        this.maxPrincipal = maxPrincipal;
    }

    public TermLimit getTermLimit() {
        return termLimit;
    }

    public void setTermLimit(TermLimit termLimit) {
        this.termLimit = termLimit;
    }

    public RateLimit getRateLimit() {
        return rateLimit;
    }

    public void setRateLimit(RateLimit rateLimit) {
        this.rateLimit = rateLimit;
    }

    public BigDecimal getBaseRate() {
        return baseRate;
    }

    public void setBaseRate(BigDecimal baseRate) {
        this.baseRate = baseRate;
    }

    public String getInterestType() {
        return interestType;
    }

    public void setInterestType(String interestType) {
        this.interestType = interestType;
    }

    public String getCompoundingFrequency() {
        return compoundingFrequency;
    }

    public void setCompoundingFrequency(String compoundingFrequency) {
        this.compoundingFrequency = compoundingFrequency;
    }

    public boolean isSupportsPeriodicPayout() {
        return supportsPeriodicPayout;
    }

    public void setSupportsPeriodicPayout(boolean supportsPeriodicPayout) {
        this.supportsPeriodicPayout = supportsPeriodicPayout;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TermLimit {
        private int minMonths;
        private int maxMonths;

        public TermLimit() {
        }

        public TermLimit(int minMonths, int maxMonths) {
            this.minMonths = minMonths;
            this.maxMonths = maxMonths;
        }

        public int getMinMonths() {
            return minMonths;
        }

        public void setMinMonths(int minMonths) {
            this.minMonths = minMonths;
        }

        public int getMaxMonths() {
            return maxMonths;
        }

        public void setMaxMonths(int maxMonths) {
            this.maxMonths = maxMonths;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RateLimit {
        private BigDecimal minRate;
        private BigDecimal maxRate;

        public RateLimit() {
        }

        public RateLimit(BigDecimal minRate, BigDecimal maxRate) {
            this.minRate = minRate;
            this.maxRate = maxRate;
        }

        public BigDecimal getMinRate() {
            return minRate;
        }

        public void setMinRate(BigDecimal minRate) {
            this.minRate = minRate;
        }

        public BigDecimal getMaxRate() {
            return maxRate;
        }

        public void setMaxRate(BigDecimal maxRate) {
            this.maxRate = maxRate;
        }
    }
}
