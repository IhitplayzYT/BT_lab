package com.example.fdmodule.dto;

public class FDApplicationResponse {
    private String fdAccountNo;
    private String customerId;
    private String productCode;
    private String principalAmount;
    private String interestRate;
    private Integer termMonths;
    private String maturityDate;
    private String status;
    private String approvalStatus;
    private String createdAt;

    public FDApplicationResponse(String fdAccountNo, String customerId, String productCode,
                                 String principalAmount, String interestRate, Integer termMonths,
                                 String maturityDate, String status, String approvalStatus, String createdAt) {
        this.fdAccountNo = fdAccountNo;
        this.customerId = customerId;
        this.productCode = productCode;
        this.principalAmount = principalAmount;
        this.interestRate = interestRate;
        this.termMonths = termMonths;
        this.maturityDate = maturityDate;
        this.status = status;
        this.approvalStatus = approvalStatus;
        this.createdAt = createdAt;
    }

    public String getFdAccountNo() { return fdAccountNo; }
    public String getCustomerId() { return customerId; }
    public String getProductCode() { return productCode; }
    public String getPrincipalAmount() { return principalAmount; }
    public String getInterestRate() { return interestRate; }
    public Integer getTermMonths() { return termMonths; }
    public String getMaturityDate() { return maturityDate; }
    public String getStatus() { return status; }
    public String getApprovalStatus() { return approvalStatus; }
    public String getCreatedAt() { return createdAt; }
}
