package com.example.fdmodule.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class BundleApplicationResponse {
    private String bundleId;
    private String customerId;
    private String bundleName;
    private String bundleDescription;
    private BigDecimal totalAmount;
    private BigDecimal estimatedReturn;
    private String status;
    private String approvalStatus;
    private String approvedBy;
    private LocalDateTime approvedAt;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private List<FDItemSummary> fdItems;

    public static class FDItemSummary {
        private String fdAccountNo;
        private String productCode;
        private BigDecimal principalAmount;
        private Integer tenureMonths;
        private String status;
        private String approvalStatus;

        public FDItemSummary(String fdAccountNo, String productCode, BigDecimal principalAmount,
                           Integer tenureMonths, String status, String approvalStatus) {
            this.fdAccountNo = fdAccountNo;
            this.productCode = productCode;
            this.principalAmount = principalAmount;
            this.tenureMonths = tenureMonths;
            this.status = status;
            this.approvalStatus = approvalStatus;
        }

        // Getters and Setters
        public String getFdAccountNo() { return fdAccountNo; }
        public void setFdAccountNo(String fdAccountNo) { this.fdAccountNo = fdAccountNo; }
        public String getProductCode() { return productCode; }
        public void setProductCode(String productCode) { this.productCode = productCode; }
        public BigDecimal getPrincipalAmount() { return principalAmount; }
        public void setPrincipalAmount(BigDecimal principalAmount) { this.principalAmount = principalAmount; }
        public Integer getTenureMonths() { return tenureMonths; }
        public void setTenureMonths(Integer tenureMonths) { this.tenureMonths = tenureMonths; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getApprovalStatus() { return approvalStatus; }
        public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }
    }

    // Getters and Setters
    public String getBundleId() { return bundleId; }
    public void setBundleId(String bundleId) { this.bundleId = bundleId; }
    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public String getBundleName() { return bundleName; }
    public void setBundleName(String bundleName) { this.bundleName = bundleName; }
    public String getBundleDescription() { return bundleDescription; }
    public void setBundleDescription(String bundleDescription) { this.bundleDescription = bundleDescription; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getEstimatedReturn() { return estimatedReturn; }
    public void setEstimatedReturn(BigDecimal estimatedReturn) { this.estimatedReturn = estimatedReturn; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<FDItemSummary> getFdItems() { return fdItems; }
    public void setFdItems(List<FDItemSummary> fdItems) { this.fdItems = fdItems; }
}
