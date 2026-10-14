package com.example.fdmodule.controller;

import com.example.fdmodule.dto.FDAccountRequest;
import com.example.fdmodule.dto.FDAccountResponse;
import com.example.fdmodule.entity.FixedDepositAccount;
import com.example.fdmodule.security.AccountAccess;
import com.example.fdmodule.service.FDAccountService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/{fdAccountNo}")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN','CUSTOMER')")
    public ResponseEntity<FixedDepositAccount> get(@PathVariable String fdAccountNo, Authentication authentication) {
        access.requireAccess(authentication, fdAccountNo);
        return ResponseEntity.ok(fdAccountService.getById(fdAccountNo));
    }
}
