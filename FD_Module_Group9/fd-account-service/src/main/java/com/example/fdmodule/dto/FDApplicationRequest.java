package com.example.fdmodule.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class FDApplicationRequest {
    @NotBlank
    private String productCode;

    @NotNull
    @DecimalMin(value = "10000.00")
    private BigDecimal principalAmount;

    @NotNull
    @Min(6)
    @Max(120)
    private Integer termMonths;

    private String nomineeName;
    private String nomineeRelation;

    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }
    public BigDecimal getPrincipalAmount() { return principalAmount; }
    public void setPrincipalAmount(BigDecimal principalAmount) { this.principalAmount = principalAmount; }
    public Integer getTermMonths() { return termMonths; }
    public void setTermMonths(Integer termMonths) { this.termMonths = termMonths; }
    public String getNomineeName() { return nomineeName; }
    public void setNomineeName(String nomineeName) { this.nomineeName = nomineeName; }
    public String getNomineeRelation() { return nomineeRelation; }
    public void setNomineeRelation(String nomineeRelation) { this.nomineeRelation = nomineeRelation; }
}
