package com.example.fdmodule.dto;

import jakarta.validation.constraints.NotBlank;

public class FDApprovalRequest {
    @NotBlank
    private String fdAccountNo;

    @NotBlank
    private String action; // APPROVE or REJECT

    private String rejectionReason;

    public String getFdAccountNo() { return fdAccountNo; }
    public void setFdAccountNo(String fdAccountNo) { this.fdAccountNo = fdAccountNo; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
