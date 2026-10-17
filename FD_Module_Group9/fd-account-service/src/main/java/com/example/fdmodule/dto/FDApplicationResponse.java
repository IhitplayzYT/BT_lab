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

    // Applicant details
    private String applicantFullName;
    private String applicantFirstName;
    private String applicantMiddleName;
    private String applicantLastName;
    private Integer applicantAge;
    private String applicantGender;
    private String applicantOccupation;
    private String applicantAnnualIncome;
    private String applicantAddress;
    private String applicantCity;
    private String applicantState;
    private String applicantPincode;
    private String applicantNationality;
    private String applicantMaritalStatus;
    private String applicantEmail;
    private String applicantPhone;
    private String applicantPan;
    private String applicantAccountNumber;
    private String applicantIfsc;

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
    public String getApplicantFullName() { return applicantFullName; }
    public void setApplicantFullName(String applicantFullName) { this.applicantFullName = applicantFullName; }
    public String getApplicantFirstName() { return applicantFirstName; }
    public void setApplicantFirstName(String applicantFirstName) { this.applicantFirstName = applicantFirstName; }
    public String getApplicantMiddleName() { return applicantMiddleName; }
    public void setApplicantMiddleName(String applicantMiddleName) { this.applicantMiddleName = applicantMiddleName; }
    public String getApplicantLastName() { return applicantLastName; }
    public void setApplicantLastName(String applicantLastName) { this.applicantLastName = applicantLastName; }
    public Integer getApplicantAge() { return applicantAge; }
    public void setApplicantAge(Integer applicantAge) { this.applicantAge = applicantAge; }
    public String getApplicantGender() { return applicantGender; }
    public void setApplicantGender(String applicantGender) { this.applicantGender = applicantGender; }
    public String getApplicantOccupation() { return applicantOccupation; }
    public void setApplicantOccupation(String applicantOccupation) { this.applicantOccupation = applicantOccupation; }
    public String getApplicantAnnualIncome() { return applicantAnnualIncome; }
    public void setApplicantAnnualIncome(String applicantAnnualIncome) { this.applicantAnnualIncome = applicantAnnualIncome; }
    public String getApplicantAddress() { return applicantAddress; }
    public void setApplicantAddress(String applicantAddress) { this.applicantAddress = applicantAddress; }
    public String getApplicantCity() { return applicantCity; }
    public void setApplicantCity(String applicantCity) { this.applicantCity = applicantCity; }
    public String getApplicantState() { return applicantState; }
    public void setApplicantState(String applicantState) { this.applicantState = applicantState; }
    public String getApplicantPincode() { return applicantPincode; }
    public void setApplicantPincode(String applicantPincode) { this.applicantPincode = applicantPincode; }
    public String getApplicantNationality() { return applicantNationality; }
    public void setApplicantNationality(String applicantNationality) { this.applicantNationality = applicantNationality; }
    public String getApplicantMaritalStatus() { return applicantMaritalStatus; }
    public void setApplicantMaritalStatus(String applicantMaritalStatus) { this.applicantMaritalStatus = applicantMaritalStatus; }
    public String getApplicantEmail() { return applicantEmail; }
    public void setApplicantEmail(String applicantEmail) { this.applicantEmail = applicantEmail; }
    public String getApplicantPhone() { return applicantPhone; }
    public void setApplicantPhone(String applicantPhone) { this.applicantPhone = applicantPhone; }
    public String getApplicantPan() { return applicantPan; }
    public void setApplicantPan(String applicantPan) { this.applicantPan = applicantPan; }
    public String getApplicantAccountNumber() { return applicantAccountNumber; }
    public void setApplicantAccountNumber(String applicantAccountNumber) { this.applicantAccountNumber = applicantAccountNumber; }
    public String getApplicantIfsc() { return applicantIfsc; }
    public void setApplicantIfsc(String applicantIfsc) { this.applicantIfsc = applicantIfsc; }
}
