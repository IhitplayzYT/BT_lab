package com.example.fdmodule.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "fd_accounts")
public class FixedDepositAccount {
    @Id
    @Column(name = "fd_account_no", length = 20)
    private String fdAccountNo;

    @Column(name = "customer_id", length = 20, nullable = false)
    private String customerId;

    @Column(name = "bundle_id", length = 50)
    private String bundleId;

    @Column(name = "bundle_name", length = 255)
    private String bundleName;

    @Column(name = "product_code", length = 50, nullable = false)
    private String productCode;

    @Column(length = 3)
    private String currency;

    @Column(name = "principal_amount", precision = 18, scale = 2, nullable = false)
    private BigDecimal principalAmount;

    @Column(name = "interest_rate", precision = 5, scale = 2, nullable = false)
    private BigDecimal interestRate;

    @Column(name = "tenure_months")
    private Integer tenureMonths;

    @Column(name = "compounding_frequency")
    private String compoundingFrequency;

    @Column(length = 20)
    private String status;

    @Column(name = "approval_status", length = 20)
    private String approvalStatus;

    @Column(name = "approved_by", length = 50)
    private String approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "nominee_name", length = 255)
    private String nomineeName;

    @Column(name = "nominee_relation", length = 50)
    private String nomineeRelation;

    @Column(name = "customer_category", length = 50)
    private String customerCategory;

    @Column(name = "account_holder_roles", length = 100)
    private String accountHolderRoles;

    @Column(name = "co_owner_name", length = 255)
    private String coOwnerName;

    @Column(name = "applicant_full_name", length = 255)
    private String applicantFullName;

    // New detailed applicant fields
    @Column(name = "applicant_first_name", length = 100)
    private String applicantFirstName;

    @Column(name = "applicant_middle_name", length = 100)
    private String applicantMiddleName;

    @Column(name = "applicant_last_name", length = 100)
    private String applicantLastName;

    @Column(name = "applicant_age")
    private Integer applicantAge;

    @Column(name = "applicant_gender", length = 20)
    private String applicantGender;

    @Column(name = "applicant_occupation", length = 100)
    private String applicantOccupation;

    @Column(name = "applicant_annual_income", precision = 15, scale = 2)
    private BigDecimal applicantAnnualIncome;

    @Column(name = "applicant_address", columnDefinition = "TEXT")
    private String applicantAddress;

    @Column(name = "applicant_city", length = 100)
    private String applicantCity;

    @Column(name = "applicant_state", length = 100)
    private String applicantState;

    @Column(name = "applicant_pincode", length = 10)
    private String applicantPincode;

    @Column(name = "applicant_nationality", length = 50)
    private String applicantNationality;

    @Column(name = "applicant_marital_status", length = 20)
    private String applicantMaritalStatus;

    @Column(name = "applicant_email", length = 255)
    private String applicantEmail;

    @Column(name = "applicant_phone", length = 20)
    private String applicantPhone;

    @Column(name = "applicant_pan", length = 20)
    private String applicantPan;

    @Column(name = "applicant_account_number", length = 50)
    private String applicantAccountNumber;

    @Column(name = "applicant_ifsc", length = 20)
    private String applicantIfsc;

    @Column(name = "maturity_date")
    private LocalDate maturityDate;

    @Column(name = "accrued_interest", precision = 18, scale = 2)
    private BigDecimal accruedInterest;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "modified_at")
    private LocalDateTime modifiedAt;

    @Column(length = 255)
    private String uuid;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (uuid == null) uuid = UUID.randomUUID().toString();
        if (status == null) status = "PENDING";
        if (approvalStatus == null) approvalStatus = "PENDING_APPROVAL";
        if (accruedInterest == null) accruedInterest = BigDecimal.ZERO;
    }

    public String getFdAccountNo() { return fdAccountNo; }
    public void setFdAccountNo(String fdAccountNo) { this.fdAccountNo = fdAccountNo; }
    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public String getBundleId() { return bundleId; }
    public void setBundleId(String bundleId) { this.bundleId = bundleId; }
    public String getBundleName() { return bundleName; }
    public void setBundleName(String bundleName) { this.bundleName = bundleName; }
    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public BigDecimal getPrincipalAmount() { return principalAmount; }
    public void setPrincipalAmount(BigDecimal principalAmount) { this.principalAmount = principalAmount; }
    public BigDecimal getInterestRate() { return interestRate; }
    public void setInterestRate(BigDecimal interestRate) { this.interestRate = interestRate; }
    public Integer getTenureMonths() { return tenureMonths; }
    public void setTenureMonths(Integer tenureMonths) { this.tenureMonths = tenureMonths; }
    public String getCompoundingFrequency() { return compoundingFrequency; }
    public void setCompoundingFrequency(String compoundingFrequency) { this.compoundingFrequency = compoundingFrequency; }
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
    public String getNomineeName() { return nomineeName; }
    public void setNomineeName(String nomineeName) { this.nomineeName = nomineeName; }
    public String getNomineeRelation() { return nomineeRelation; }
    public void setNomineeRelation(String nomineeRelation) { this.nomineeRelation = nomineeRelation; }
    public String getCustomerCategory() { return customerCategory; }
    public void setCustomerCategory(String customerCategory) { this.customerCategory = customerCategory; }
    public String getAccountHolderRoles() { return accountHolderRoles; }
    public void setAccountHolderRoles(String accountHolderRoles) { this.accountHolderRoles = accountHolderRoles; }
    public String getCoOwnerName() { return coOwnerName; }
    public void setCoOwnerName(String coOwnerName) { this.coOwnerName = coOwnerName; }
    public String getApplicantFullName() { return applicantFullName; }
    public void setApplicantFullName(String applicantFullName) { this.applicantFullName = applicantFullName; }
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
    public LocalDate getMaturityDate() { return maturityDate; }
    public void setMaturityDate(LocalDate maturityDate) { this.maturityDate = maturityDate; }
    public BigDecimal getAccruedInterest() { return accruedInterest; }
    public void setAccruedInterest(BigDecimal accruedInterest) { this.accruedInterest = accruedInterest; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getModifiedAt() { return modifiedAt; }
    public void setModifiedAt(LocalDateTime modifiedAt) { this.modifiedAt = modifiedAt; }
    public String getUuid() { return uuid; }
    public void setUuid(String uuid) { this.uuid = uuid; }
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
    public BigDecimal getApplicantAnnualIncome() { return applicantAnnualIncome; }
    public void setApplicantAnnualIncome(BigDecimal applicantAnnualIncome) { this.applicantAnnualIncome = applicantAnnualIncome; }
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
}
