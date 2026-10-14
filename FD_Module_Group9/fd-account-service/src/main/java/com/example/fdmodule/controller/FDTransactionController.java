package com.example.fdmodule.controller;

import com.example.fdmodule.dto.FDAccountCreationResponse;
import com.example.fdmodule.dto.FDAccountRequest;
import com.example.fdmodule.dto.FDTransactionResponse;
import com.example.fdmodule.security.AccountAccess;
import com.example.fdmodule.service.FDTransactionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Lab 16 endpoints. Kept separate from the L12/L13 {@code FDAccountController} so the existing
 * controller is untouched; both share the {@code /api/fd/account} base path without overlap.
 */
@RestController
@RequestMapping("/api/fd/account")
public class FDTransactionController {

    private final FDTransactionService fdTransactionService;
    private final AccountAccess access;

    public FDTransactionController(FDTransactionService fdTransactionService, AccountAccess access) {
        this.fdTransactionService = fdTransactionService;
        this.access = access;
    }

    /** Lab Manual L16 section 5.1: only BANK_OFFICER may create an FD with its initial deposit. */
    @PostMapping("/create-with-txn")
    @PreAuthorize("hasRole('BANK_OFFICER')")
    public ResponseEntity<FDAccountCreationResponse> createWithTransaction(
            @Valid @RequestBody FDAccountRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                fdTransactionService.createFDAccountWithTransaction(request, authentication.getName()));
    }

    /**
     * Transaction history (the link returned by create-with-txn). Same roles as the existing
     * {@code GET /api/fd/account/{fdAccountNo}}; a CUSTOMER only sees their own FD (see {@link AccountAccess}).
     */
    @GetMapping("/{fdAccountNo}/transactions")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN','CUSTOMER')")
    public ResponseEntity<List<FDTransactionResponse>> getTransactions(@PathVariable String fdAccountNo,
                                                                         Authentication authentication) {
        access.requireAccess(authentication, fdAccountNo);
        return ResponseEntity.ok(fdTransactionService.getTransactions(fdAccountNo));
    }
}
