package com.example.fdmodule.controller;

import com.example.fdmodule.dto.*;
import com.example.fdmodule.entity.FixedDepositAccount;
import com.example.fdmodule.security.AccountAccess;
import com.example.fdmodule.service.FDAccountService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PostMapping("/approve")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public ResponseEntity<String> approveOrReject(
            @Valid @RequestBody FDApprovalRequest request,
            Authentication authentication) {
        fdAccountService.approveOrRejectFD(request, authentication.getName());
        return ResponseEntity.ok("FD application processed successfully");
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public ResponseEntity<List<FixedDepositAccount>> getPendingApplications() {
        return ResponseEntity.ok(fdAccountService.getPendingApplications());
    }

    @GetMapping("/my-applications")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<FixedDepositAccount>> getMyApplications(Authentication authentication) {
        return ResponseEntity.ok(fdAccountService.getCustomerApplications(authentication.getName()));
    }

    @GetMapping("/{fdAccountNo}")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN','CUSTOMER')")
    public ResponseEntity<FixedDepositAccount> get(@PathVariable String fdAccountNo, Authentication authentication) {
        access.requireAccess(authentication, fdAccountNo);
        return ResponseEntity.ok(fdAccountService.getById(fdAccountNo));
    }
}
