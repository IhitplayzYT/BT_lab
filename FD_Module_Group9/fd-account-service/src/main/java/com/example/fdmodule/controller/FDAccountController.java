package com.example.fdmodule.controller;

import com.example.fdmodule.dto.*;
import com.example.fdmodule.entity.*;
import com.example.fdmodule.security.AccountAccess;
import com.example.fdmodule.service.FDAccountService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fd/account")
public class FDAccountController {
    private final FDAccountService fdAccountService;
    private final AccountAccess access;

    public FDAccountController(FDAccountService fdAccountService, AccountAccess access) {
        this.fdAccountService = fdAccountService;
        this.access = access;
    }

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public ResponseEntity<FDAccountResponse> create(
            @Valid @RequestBody FDAccountRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(fdAccountService.create(request, authentication.getName()));
    }

    @PostMapping("/apply")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<FDApplicationResponse> apply(
            @Valid @RequestBody FDApplicationRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(fdAccountService.applyForFD(request, authentication.getName()));
    }

    @PostMapping("/apply-for-user/{userId}")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public ResponseEntity<FDApplicationResponse> applyForCustomer(
            @PathVariable String userId,
            @Valid @RequestBody FDApplicationRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(fdAccountService.applyForCustomer(request, userId, authentication.getName()));
    }

    @GetMapping("/customers/{customerId}")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public ResponseEntity<Map<String, String>> getCustomerSummary(@PathVariable String customerId) {
        return ResponseEntity.ok(fdAccountService.getCustomerSummary(customerId));
    }

    @PutMapping("/profile/category")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, String>> updateCustomerCategory(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        String category = fdAccountService.updateCustomerCategory(authentication.getName(), request.get("customerCategory"));
        return ResponseEntity.ok(Map.of("customerCategory", category));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getCustomerIdentity(Authentication authentication) {
        return ResponseEntity.ok(fdAccountService.getCustomerIdentity(authentication.getName()));
    }

    @PostMapping("/approve")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public ResponseEntity<Map<String, String>> approveOrReject(
            @Valid @RequestBody FDApprovalRequest request,
            Authentication authentication) {
        fdAccountService.approveOrRejectFD(request, authentication.getName());
        Map<String, String> response = new HashMap<>();
        response.put("message", "FD application processed successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public ResponseEntity<List<FDApplicationResponse>> getPendingApplications() {
        List<FixedDepositAccount> accounts = fdAccountService.getPendingApplications();
        List<FDApplicationResponse> responses = accounts.stream()
                .map(acc -> {
                    FDApplicationResponse response = new FDApplicationResponse(
                            acc.getFdAccountNo(), acc.getCustomerId(), acc.getProductCode(),
                            acc.getPrincipalAmount().toString(), acc.getInterestRate().toString(),
                            acc.getTenureMonths(), acc.getMaturityDate().toString(),
                            acc.getStatus(), acc.getApprovalStatus(), acc.getCreatedAt().toString());
                    response.setUserId(fdAccountService.getUserIdForCustomer(acc.getCustomerId()));
                    response.setApplicantFullName(acc.getApplicantFullName());
                    response.setCustomerCategory(acc.getCustomerCategory());
                    response.setAccountHolderRoles(acc.getAccountHolderRoles());
                    response.setCoOwnerName(acc.getCoOwnerName());
                    response.setApplicantFirstName(acc.getApplicantFirstName());
                    response.setApplicantMiddleName(acc.getApplicantMiddleName());
                    response.setApplicantLastName(acc.getApplicantLastName());
                    response.setApplicantAge(acc.getApplicantAge());
                    response.setApplicantGender(acc.getApplicantGender());
                    response.setApplicantOccupation(acc.getApplicantOccupation());
                    response.setApplicantAnnualIncome(acc.getApplicantAnnualIncome() != null ? acc.getApplicantAnnualIncome().toString() : null);
                    response.setApplicantAddress(acc.getApplicantAddress());
                    response.setApplicantCity(acc.getApplicantCity());
                    response.setApplicantState(acc.getApplicantState());
                    response.setApplicantPincode(acc.getApplicantPincode());
                    response.setApplicantNationality(acc.getApplicantNationality());
                    response.setApplicantMaritalStatus(acc.getApplicantMaritalStatus());
                    response.setApplicantEmail(acc.getApplicantEmail());
                    response.setApplicantPhone(acc.getApplicantPhone());
                    response.setApplicantPan(acc.getApplicantPan());
                    response.setApplicantAccountNumber(acc.getApplicantAccountNumber());
                    response.setApplicantIfsc(acc.getApplicantIfsc());
                    response.setAccruedInterest(acc.getAccruedInterest() != null ? acc.getAccruedInterest().toString() : "0");
                    // Calculate maturity amount: principal + (principal * rate * tenure / 12 / 100)
                    java.math.BigDecimal principal = acc.getPrincipalAmount();
                    java.math.BigDecimal rate = acc.getInterestRate();
                    Integer tenure = acc.getTenureMonths();
                    java.math.BigDecimal maturityAmount = principal.add(
                        principal.multiply(rate).multiply(java.math.BigDecimal.valueOf(tenure))
                        .divide(java.math.BigDecimal.valueOf(1200), 2, java.math.RoundingMode.HALF_UP)
                    );
                    response.setMaturityAmount(maturityAmount.toString());
                   	return response;
                })
                .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/my-applications")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<FDApplicationResponse>> getMyApplications(Authentication authentication) {
        List<FixedDepositAccount> accounts = fdAccountService.getCustomerApplications(authentication.getName());
        List<FDApplicationResponse> responses = accounts.stream()
                .map(acc -> {
                    FDApplicationResponse response = new FDApplicationResponse(
                            acc.getFdAccountNo(), acc.getCustomerId(), acc.getProductCode(),
                            acc.getPrincipalAmount().toString(), acc.getInterestRate().toString(),
                            acc.getTenureMonths(), acc.getMaturityDate().toString(),
                            acc.getStatus(), acc.getApprovalStatus(), acc.getCreatedAt().toString());
                    response.setUserId(fdAccountService.getUserIdForCustomer(acc.getCustomerId()));
                    response.setApplicantFullName(acc.getApplicantFullName());
                    response.setCustomerCategory(acc.getCustomerCategory());
                    response.setAccountHolderRoles(acc.getAccountHolderRoles());
                    response.setCoOwnerName(acc.getCoOwnerName());
                    response.setApplicantFirstName(acc.getApplicantFirstName());
                    response.setApplicantMiddleName(acc.getApplicantMiddleName());
                    response.setApplicantLastName(acc.getApplicantLastName());
                    response.setApplicantAge(acc.getApplicantAge());
                    response.setApplicantGender(acc.getApplicantGender());
                    response.setApplicantOccupation(acc.getApplicantOccupation());
                    response.setApplicantAnnualIncome(acc.getApplicantAnnualIncome() != null ? acc.getApplicantAnnualIncome().toString() : null);
                    response.setApplicantAddress(acc.getApplicantAddress());
                    response.setApplicantCity(acc.getApplicantCity());
                    response.setApplicantState(acc.getApplicantState());
                    response.setApplicantPincode(acc.getApplicantPincode());
                    response.setApplicantNationality(acc.getApplicantNationality());
                    response.setApplicantMaritalStatus(acc.getApplicantMaritalStatus());
                    response.setApplicantEmail(acc.getApplicantEmail());
                    response.setApplicantPhone(acc.getApplicantPhone());
                    response.setApplicantPan(acc.getApplicantPan());
                    response.setApplicantAccountNumber(acc.getApplicantAccountNumber());
                    response.setApplicantIfsc(acc.getApplicantIfsc());
                    response.setAccruedInterest(acc.getAccruedInterest() != null ? acc.getAccruedInterest().toString() : "0");
                    response.setNomineeName(acc.getNomineeName());
                    response.setNomineeRelation(acc.getNomineeRelation());
                    // Calculate maturity amount: principal + (principal * rate * tenure / 12 / 100)
                    java.math.BigDecimal principal = acc.getPrincipalAmount();
                    java.math.BigDecimal rate = acc.getInterestRate();
                    Integer tenure = acc.getTenureMonths();
                    java.math.BigDecimal maturityAmount = principal.add(
                        principal.multiply(rate).multiply(java.math.BigDecimal.valueOf(tenure))
                        .divide(java.math.BigDecimal.valueOf(1200), 2, java.math.RoundingMode.HALF_UP)
                    );
                    response.setMaturityAmount(maturityAmount.toString());
                   	return response;
                })
                .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/all-applications")
    @PreAuthorize("hasAnyRole('ADMIN','BANK_OFFICER')")
    public ResponseEntity<List<FDApplicationResponse>> getAllApplications() {
        List<FixedDepositAccount> accounts = fdAccountService.getAllApplications();
        Map<String, List<FDApplicationRequest.NomineeDTO>> nomineesByAccount = new HashMap<>();
        fdAccountService.getNomineesByAccountNos(accounts.stream()
                        .map(FixedDepositAccount::getFdAccountNo)
                        .toList())
                .forEach(nominee -> nomineesByAccount
                        .computeIfAbsent(nominee.getFdAccountNo(), ignored -> new java.util.ArrayList<>())
                        .add(toNomineeDto(nominee)));
        List<FDApplicationResponse> responses = accounts.stream()
                .map(acc -> {
                    FDApplicationResponse response = new FDApplicationResponse(
                            acc.getFdAccountNo(), acc.getCustomerId(), acc.getProductCode(),
                            acc.getPrincipalAmount().toString(), acc.getInterestRate().toString(),
                            acc.getTenureMonths(), acc.getMaturityDate().toString(),
                            acc.getStatus(), acc.getApprovalStatus(), acc.getCreatedAt().toString());
                    response.setUserId(fdAccountService.getUserIdForCustomer(acc.getCustomerId()));
                    response.setApplicantFullName(acc.getApplicantFullName());
                    response.setCustomerCategory(acc.getCustomerCategory());
                    response.setAccountHolderRoles(acc.getAccountHolderRoles());
                    response.setCoOwnerName(acc.getCoOwnerName());
                    response.setApplicantFirstName(acc.getApplicantFirstName());
                    response.setApplicantMiddleName(acc.getApplicantMiddleName());
                    response.setApplicantLastName(acc.getApplicantLastName());
                    response.setApplicantAge(acc.getApplicantAge());
                    response.setApplicantGender(acc.getApplicantGender());
                    response.setApplicantOccupation(acc.getApplicantOccupation());
                    response.setApplicantAnnualIncome(acc.getApplicantAnnualIncome() != null ? acc.getApplicantAnnualIncome().toString() : null);
                    response.setApplicantAddress(acc.getApplicantAddress());
                    response.setApplicantCity(acc.getApplicantCity());
                    response.setApplicantState(acc.getApplicantState());
                    response.setApplicantPincode(acc.getApplicantPincode());
                    response.setApplicantNationality(acc.getApplicantNationality());
                    response.setApplicantMaritalStatus(acc.getApplicantMaritalStatus());
                    response.setApplicantEmail(acc.getApplicantEmail());
                    response.setApplicantPhone(acc.getApplicantPhone());
                    response.setApplicantPan(acc.getApplicantPan());
                    response.setApplicantAccountNumber(acc.getApplicantAccountNumber());
                    response.setApplicantIfsc(acc.getApplicantIfsc());
                    response.setAccruedInterest(acc.getAccruedInterest() != null ? acc.getAccruedInterest().toString() : "0");
                    response.setNomineeName(acc.getNomineeName());
                    response.setNomineeRelation(acc.getNomineeRelation());
                    response.setNominees(nomineesByAccount.getOrDefault(acc.getFdAccountNo(), List.of()));
                    // Calculate maturity amount: principal + (principal * rate * tenure / 12 / 100)
                    java.math.BigDecimal principal = acc.getPrincipalAmount();
                    java.math.BigDecimal rate = acc.getInterestRate();
                    Integer tenure = acc.getTenureMonths();
                    java.math.BigDecimal maturityAmount = principal.add(
                        principal.multiply(rate).multiply(java.math.BigDecimal.valueOf(tenure))
                        .divide(java.math.BigDecimal.valueOf(1200), 2, java.math.RoundingMode.HALF_UP)
                    );
                    response.setMaturityAmount(maturityAmount.toString());
                   	return response;
                })
                .toList();
        return ResponseEntity.ok(responses);
    }

    private FDApplicationRequest.NomineeDTO toNomineeDto(Nominee nominee) {
        FDApplicationRequest.NomineeDTO dto = new FDApplicationRequest.NomineeDTO();
        dto.setName(nominee.getNomineeName());
        dto.setRelation(nominee.getNomineeRelation());
        return dto;
    }

    @PostMapping("/bundle/apply")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<BundleApplicationResponse> applyForBundle(
            @Valid @RequestBody BundleApplicationRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(fdAccountService.applyForBundle(request, authentication.getName()));
    }

    @PostMapping("/bundle/{bundleId}/approve")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public ResponseEntity<Map<String, String>> approveOrRejectBundle(
            @PathVariable String bundleId,
            @RequestBody BundleApprovalRequest request,
            Authentication authentication) {
        fdAccountService.approveOrRejectBundle(bundleId, request.getAction(), request.getRejectionReason(), authentication.getName());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Bundle processed successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/bundle/pending")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getPendingBundles() {
        List<BundleApplication> bundles = fdAccountService.getPendingBundles();
        List<Map<String, Object>> response = bundles.stream()
                .map(bundle -> {
                    Map<String, Object> bundleData = new HashMap<>();
                    bundleData.put("bundleId", bundle.getBundleId());
                    bundleData.put("customerId", bundle.getCustomerId());
                    bundleData.put("userId", fdAccountService.getUserIdForCustomer(bundle.getCustomerId()));
                    bundleData.put("bundleName", bundle.getBundleName());
                    bundleData.put("bundleDescription", bundle.getBundleDescription());
                    bundleData.put("totalAmount", bundle.getTotalAmount());
                    bundleData.put("estimatedReturn", bundle.getEstimatedReturn());
                    bundleData.put("status", bundle.getStatus());
                    bundleData.put("approvalStatus", bundle.getApprovalStatus());
                    bundleData.put("createdAt", bundle.getCreatedAt());

                    // Load exactly the FDs linked to this bundle. The customer
                    // application lookup accepts a login name, not customerId.
                    List<FixedDepositAccount> bundleFDs = fdAccountService.getBundleAccounts(bundle.getBundleId());
                    bundleData.put("fdCount", bundleFDs.size());
                    bundleData.put("fdItems", bundleFDs.stream().map(fd -> {
                        Map<String, Object> item = new HashMap<>();
                        item.put("fdAccountNo", fd.getFdAccountNo());
                        item.put("productCode", fd.getProductCode());
                        item.put("principalAmount", fd.getPrincipalAmount());
                        item.put("tenureMonths", fd.getTenureMonths());
                        item.put("interestRate", fd.getInterestRate());
                        item.put("status", fd.getStatus());
                        item.put("approvalStatus", fd.getApprovalStatus());
                        return item;
                    }).toList());
                    if (!bundleFDs.isEmpty()) {
                        FixedDepositAccount firstFD = bundleFDs.get(0);
                        Map<String, Object> customerDetails = new HashMap<>();
                        customerDetails.put("fullName", firstFD.getApplicantFullName());
                        customerDetails.put("firstName", firstFD.getApplicantFirstName());
                        customerDetails.put("lastName", firstFD.getApplicantLastName());
                        customerDetails.put("age", firstFD.getApplicantAge());
                        customerDetails.put("gender", firstFD.getApplicantGender());
                        customerDetails.put("occupation", firstFD.getApplicantOccupation());
                        customerDetails.put("annualIncome", firstFD.getApplicantAnnualIncome());
                        customerDetails.put("email", firstFD.getApplicantEmail());
                        customerDetails.put("phone", firstFD.getApplicantPhone());
                        customerDetails.put("maritalStatus", firstFD.getApplicantMaritalStatus());
                        customerDetails.put("nationality", firstFD.getApplicantNationality());
                        bundleData.put("customerDetails", customerDetails);
                    }

                    return bundleData;
                })
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/bundle/my-bundles")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<BundleApplication>> getMyBundles(Authentication authentication) {
        return ResponseEntity.ok(fdAccountService.getCustomerBundles(authentication.getName()));
    }

    @GetMapping("/{fdAccountNo}")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN','CUSTOMER')")
    public ResponseEntity<FixedDepositAccount> get(@PathVariable String fdAccountNo, Authentication authentication) {
        access.requireAccess(authentication, fdAccountNo);
        return ResponseEntity.ok(fdAccountService.getById(fdAccountNo));
    }

    @PostMapping("/{fdAccountNo}/withdraw")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, String>> withdrawApplication(
            @PathVariable String fdAccountNo,
            Authentication authentication) {
        fdAccountService.withdrawApplication(fdAccountNo, authentication.getName());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Application withdrawn successfully");
        return ResponseEntity.ok(response);
    }
}
