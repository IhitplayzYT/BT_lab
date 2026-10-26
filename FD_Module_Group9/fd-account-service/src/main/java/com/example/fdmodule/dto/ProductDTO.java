package com.example.fdmodule.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Simple DTO to hold product data from the external Product & Pricing service.
 * This replaces the local Product entity since we now use the centralized product service.
 */
public class ProductDTO {
    private String productCode;
    private String productName;
    private String productType;
    private String interestType;
    private String currency;
    private LocalDate effectiveDate;
    private Integer minTermMonths;
    private Integer maxTermMonths;
    private BigDecimal minRate;
    private BigDecimal maxRate;
    private BigDecimal minDeposit;
    private BigDecimal maxDeposit;
    private BigDecimal rateCapAddon;
    private BigDecimal preMaturityPenaltyPct;
    private String compoundingFrequency;
    private java.math.BigDecimal serviceFeeRate;
    private java.math.BigDecimal serviceFeeFlat;
    private java.math.BigDecimal documentationFee;
    private java.math.BigDecimal gstRate;
    private java.math.BigDecimal taxRate;
    private java.math.BigDecimal prematurePenaltyRate;
    private String status;
    private List<String> allowedRoles;

    public ProductDTO() {}

    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getProductType() { return productType; }
    public void setProductType(String productType) { this.productType = productType; }
    public String getInterestType() { return interestType; }
    public void setInterestType(String interestType) { this.interestType = interestType; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public LocalDate getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(LocalDate effectiveDate) { this.effectiveDate = effectiveDate; }
    public Integer getMinTermMonths() { return minTermMonths; }
    public void setMinTermMonths(Integer minTermMonths) { this.minTermMonths = minTermMonths; }
    public Integer getMaxTermMonths() { return maxTermMonths; }
    public void setMaxTermMonths(Integer maxTermMonths) { this.maxTermMonths = maxTermMonths; }
    public BigDecimal getMinRate() { return minRate; }
    public void setMinRate(BigDecimal minRate) { this.minRate = minRate; }
    public BigDecimal getMaxRate() { return maxRate; }
    public void setMaxRate(BigDecimal maxRate) { this.maxRate = maxRate; }
    public BigDecimal getMinDeposit() { return minDeposit; }
    public void setMinDeposit(BigDecimal minDeposit) { this.minDeposit = minDeposit; }
    public BigDecimal getMaxDeposit() { return maxDeposit; }
    public void setMaxDeposit(BigDecimal maxDeposit) { this.maxDeposit = maxDeposit; }
    public BigDecimal getRateCapAddon() { return rateCapAddon; }
    public void setRateCapAddon(BigDecimal rateCapAddon) { this.rateCapAddon = rateCapAddon; }
    public BigDecimal getPreMaturityPenaltyPct() { return preMaturityPenaltyPct; }
    public void setPreMaturityPenaltyPct(BigDecimal preMaturityPenaltyPct) { this.preMaturityPenaltyPct = preMaturityPenaltyPct; }
    public String getCompoundingFrequency() { return compoundingFrequency; }
    public void setCompoundingFrequency(String compoundingFrequency) { this.compoundingFrequency = compoundingFrequency; }
    public java.math.BigDecimal getServiceFeeRate() { return serviceFeeRate; }
    public void setServiceFeeRate(java.math.BigDecimal value) { this.serviceFeeRate = value; }
    public java.math.BigDecimal getServiceFeeFlat() { return serviceFeeFlat; }
    public void setServiceFeeFlat(java.math.BigDecimal value) { this.serviceFeeFlat = value; }
    public java.math.BigDecimal getDocumentationFee() { return documentationFee; }
    public void setDocumentationFee(java.math.BigDecimal value) { this.documentationFee = value; }
    public java.math.BigDecimal getGstRate() { return gstRate; }
    public void setGstRate(java.math.BigDecimal value) { this.gstRate = value; }
    public java.math.BigDecimal getTaxRate() { return taxRate; }
    public void setTaxRate(java.math.BigDecimal value) { this.taxRate = value; }
    public java.math.BigDecimal getPrematurePenaltyRate() { return prematurePenaltyRate; }
    public void setPrematurePenaltyRate(java.math.BigDecimal value) { this.prematurePenaltyRate = value; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<String> getAllowedRoles() { return allowedRoles; }
    public void setAllowedRoles(List<String> allowedRoles) { this.allowedRoles = allowedRoles; }
}
