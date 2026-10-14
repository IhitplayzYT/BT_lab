package com.example.fdmodule.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class FDAccountRequest {
    @NotBlank
    private String customerId;

    @NotBlank
    private String productCode;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal principalAmount;

    @NotNull
    @Min(1)
    private Integer termMonths;

    @NotBlank
    private String branchCode;

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }
    public BigDecimal getPrincipalAmount() { return principalAmount; }
    public void setPrincipalAmount(BigDecimal principalAmount) { this.principalAmount = principalAmount; }
    public Integer getTermMonths() { return termMonths; }
    public void setTermMonths(Integer termMonths) { this.termMonths = termMonths; }
    public String getBranchCode() { return branchCode; }
    public void setBranchCode(String branchCode) { this.branchCode = branchCode; }
}
