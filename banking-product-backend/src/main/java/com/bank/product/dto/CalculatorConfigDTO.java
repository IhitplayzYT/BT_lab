package com.bank.product.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for internal calculator-config endpoint.
 * Used by FD Calculator service to fetch product configuration.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class CalculatorConfigDTO {

    private java.util.Map<String, BigDecimal> categoryBonuses;
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

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TermLimit {
        private int minMonths;
        private int maxMonths;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RateLimit {
        private BigDecimal minRate;
        private BigDecimal maxRate;
    }
}
