package com.example.fdmodule.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class BundleApplicationRequest {
    @NotBlank(message = "Bundle name is required")
    @Size(max = 255, message = "Bundle name must not exceed 255 characters")
    private String bundleName;

    private String bundleDescription;

    @NotNull(message = "Total amount is required")
    private BigDecimal totalAmount;

    private BigDecimal estimatedReturn;

    private String customerCategory;
    private List<String> accountHolderRoles;
    private String coOwnerName;

    @NotNull(message = "FD items are required")
    @Size(min = 1, message = "A bundle must contain at least one FD item")
    @Valid
    private List<BundleFDItem> fdItems;

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class BundleFDItem {
        @NotBlank(message = "Product code is required")
        private String productCode;

        @NotNull(message = "Principal amount is required")
        private BigDecimal principalAmount;

        @NotNull(message = "Tenure months is required")
        private Integer tenureMonths;

        private String interestType;

        // Applicant details (same for all FDs in bundle)
        private String applicantFirstName;
        private String applicantMiddleName;
        private String applicantLastName;
        private Integer applicantAge;
        private String applicantGender;
        private String applicantOccupation;
        private BigDecimal applicantAnnualIncome;
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
        private String nomineeName;
        private String nomineeRelation;
        @Valid
        private List<FDApplicationRequest.NomineeDTO> nominees;

        // Getters and Setters
        public String getProductCode() { return productCode; }
        public void setProductCode(String productCode) { this.productCode = productCode; }
        public BigDecimal getPrincipalAmount() { return principalAmount; }
        public void setPrincipalAmount(BigDecimal principalAmount) { this.principalAmount = principalAmount; }
        public Integer getTenureMonths() { return tenureMonths; }
        public void setTenureMonths(Integer tenureMonths) { this.tenureMonths = tenureMonths; }
        public String getInterestType() { return interestType; }
        public void setInterestType(String interestType) { this.interestType = interestType; }
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
        public String getNomineeName() { return nomineeName; }
        public void setNomineeName(String nomineeName) { this.nomineeName = nomineeName; }
        public String getNomineeRelation() { return nomineeRelation; }
        public void setNomineeRelation(String nomineeRelation) { this.nomineeRelation = nomineeRelation; }
        public List<FDApplicationRequest.NomineeDTO> getNominees() { return nominees; }
        public void setNominees(List<FDApplicationRequest.NomineeDTO> nominees) { this.nominees = nominees; }
    }

    // Getters and Setters
    public String getBundleName() { return bundleName; }
    public void setBundleName(String bundleName) { this.bundleName = bundleName; }
    public String getBundleDescription() { return bundleDescription; }
    public void setBundleDescription(String bundleDescription) { this.bundleDescription = bundleDescription; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getEstimatedReturn() { return estimatedReturn; }
    public void setEstimatedReturn(BigDecimal estimatedReturn) { this.estimatedReturn = estimatedReturn; }
    public String getCustomerCategory() { return customerCategory; }
    public void setCustomerCategory(String customerCategory) { this.customerCategory = customerCategory; }
    public List<String> getAccountHolderRoles() { return accountHolderRoles; }
    public void setAccountHolderRoles(List<String> accountHolderRoles) { this.accountHolderRoles = accountHolderRoles; }
    public String getCoOwnerName() { return coOwnerName; }
    public void setCoOwnerName(String coOwnerName) { this.coOwnerName = coOwnerName; }
    public List<BundleFDItem> getFdItems() { return fdItems; }
    public void setFdItems(List<BundleFDItem> fdItems) { this.fdItems = fdItems; }
}
