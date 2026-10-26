package com.example.fdmodule.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public class FDApplicationRequest {
    @NotBlank
    private String productCode;

    @NotNull
    @DecimalMin(value = "10000.00")
    private BigDecimal principalAmount;

    @NotBlank
    @Pattern(regexp = "^[0-9]+$", message = "Term months must be a number")
    private String termMonths;

    @NotBlank
    @Size(max = 255)
    @Pattern(regexp = "^[a-zA-Z\\s]+$", message = "Full name must contain only letters and spaces")
    private String applicantFullName;

    // New detailed applicant fields
    @Size(max = 100)
    private String applicantFirstName;

    @Size(max = 100)
    private String applicantMiddleName;

    @Size(max = 100)
    private String applicantLastName;

    @Min(18)
    @Max(120)
    private Integer applicantAge;

    @Size(max = 20)
    private String applicantGender;

    @Size(max = 100)
    private String applicantOccupation;

    private BigDecimal applicantAnnualIncome;

    @Size(max = 500)
    private String applicantAddress;

    @Size(max = 100)
    private String applicantCity;

    @Size(max = 100)
    private String applicantState;

    @Size(max = 10)
    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Invalid pincode format")
    private String applicantPincode;

    @Size(max = 50)
    private String applicantNationality;

    @Size(max = 20)
    private String applicantMaritalStatus;

    @NotBlank
    @Email
    @Size(max = 255)
    private String applicantEmail;

    @NotBlank
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String applicantPhone;

    @NotBlank
    @Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]$", message = "Invalid PAN format")
    private String applicantPan;

    @NotBlank
    @Size(max = 50)
    @Pattern(regexp = "^[0-9]{9,18}$", message = "Account number must be 9-18 digits")
    private String applicantAccountNumber;

    @NotBlank
    @Size(max = 11)
    @Pattern(regexp = "^[A-Z]{4}0[A-Z0-9]{6}$", message = "Invalid IFSC format")
    private String applicantIfsc;

    private List<NomineeDTO> nominees;

    @Size(max = 50)
    private String customerCategory;

    @Size(max = 2)
    private List<String> accountHolderRoles;

    @Size(max = 255)
    @Pattern(regexp = "^[a-zA-Z\\s]*$", message = "Co-owner name must contain only letters and spaces")
    private String coOwnerName;

    public static class NomineeDTO {
        @NotBlank
        @Size(max = 255)
        private String name;

        @NotBlank
        @Size(max = 50)
        private String relation;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getRelation() { return relation; }
        public void setRelation(String relation) { this.relation = relation; }
    }

    // Legacy fields for backward compatibility
    @Deprecated
    @Size(max = 255)
    private String nomineeName;

    @Deprecated
    @Size(max = 50)
    private String nomineeRelation;

    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }
    public BigDecimal getPrincipalAmount() { return principalAmount; }
    public void setPrincipalAmount(BigDecimal principalAmount) { this.principalAmount = principalAmount; }
    public String getTermMonths() { return termMonths; }
    public void setTermMonths(String termMonths) { this.termMonths = termMonths; }
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
    public List<NomineeDTO> getNominees() { return nominees; }
    public void setNominees(List<NomineeDTO> nominees) { this.nominees = nominees; }
    public String getCustomerCategory() { return customerCategory; }
    public void setCustomerCategory(String customerCategory) { this.customerCategory = customerCategory; }
    public List<String> getAccountHolderRoles() { return accountHolderRoles; }
    public void setAccountHolderRoles(List<String> accountHolderRoles) { this.accountHolderRoles = accountHolderRoles; }
    public String getCoOwnerName() { return coOwnerName; }
    public void setCoOwnerName(String coOwnerName) { this.coOwnerName = coOwnerName; }
    public String getNomineeName() { return nomineeName; }
    public void setNomineeName(String nomineeName) { this.nomineeName = nomineeName; }
    public String getNomineeRelation() { return nomineeRelation; }
    public void setNomineeRelation(String nomineeRelation) { this.nomineeRelation = nomineeRelation; }
}
