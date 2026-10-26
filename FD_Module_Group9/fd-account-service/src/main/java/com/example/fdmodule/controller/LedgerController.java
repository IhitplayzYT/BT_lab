package com.example.fdmodule.controller;

import com.example.fdmodule.dto.FDTransactionResponse;
import com.example.fdmodule.dto.LedgerAccountResponse;
import com.example.fdmodule.entity.FixedDepositAccount;
import com.example.fdmodule.repository.FixedDepositAccountRepository;
import com.example.fdmodule.repository.FDTransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Ledger Controller - Provides search functionality for FD accounts (ledgers)
 * and access to individual account transaction histories.
 * Bank officers can search accounts by name or ID and view their ledger.
 */
@RestController
@RequestMapping("/api/fd/ledger")
public class LedgerController {

    private final FixedDepositAccountRepository accountRepository;
    private final FDTransactionRepository transactionRepository;

    public LedgerController(FixedDepositAccountRepository accountRepository,
                            FDTransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    /**
     * Search FD accounts by customer name
     */
    @GetMapping("/search-by-name")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public ResponseEntity<List<LedgerAccountResponse>> searchByName(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        List<FixedDepositAccount> accounts = accountRepository
                .findByApplicantFullNameContainingIgnoreCase(name);
        
        // Apply pagination
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, accounts.size());
        
        if (fromIndex >= accounts.size()) {
            return ResponseEntity.ok(List.of());
        }
        
        List<FixedDepositAccount> pagedAccounts = accounts.subList(fromIndex, toIndex);
        List<LedgerAccountResponse> responses = pagedAccounts.stream()
                .map(LedgerAccountResponse::from)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }

    /**
     * Search FD accounts by customer ID
     */
    @GetMapping("/search-by-id")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public ResponseEntity<List<LedgerAccountResponse>> searchById(
            @RequestParam String customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        List<FixedDepositAccount> accounts = accountRepository
                .findByCustomerIdContainingIgnoreCase(customerId);
        
        // Apply pagination
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, accounts.size());
        
        if (fromIndex >= accounts.size()) {
            return ResponseEntity.ok(List.of());
        }
        
        List<FixedDepositAccount> pagedAccounts = accounts.subList(fromIndex, toIndex);
        List<LedgerAccountResponse> responses = pagedAccounts.stream()
                .map(LedgerAccountResponse::from)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }

    /**
     * Get all FD accounts (with pagination)
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public ResponseEntity<List<LedgerAccountResponse>> getAllAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        List<FixedDepositAccount> accounts = accountRepository.findAll();
        
        // Apply pagination
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, accounts.size());
        
        if (fromIndex >= accounts.size()) {
            return ResponseEntity.ok(List.of());
        }
        
        List<FixedDepositAccount> pagedAccounts = accounts.subList(fromIndex, toIndex);
        List<LedgerAccountResponse> responses = pagedAccounts.stream()
                .map(LedgerAccountResponse::from)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }

    /**
     * Get transaction history for a specific FD account (ledger view)
     */
    @GetMapping("/{fdAccountNo}/transactions")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN','CUSTOMER')")
    public ResponseEntity<List<FDTransactionResponse>> getAccountLedger(
            @PathVariable String fdAccountNo) {
        
        if (!accountRepository.existsById(fdAccountNo)) {
            throw new IllegalArgumentException("FD account not found: " + fdAccountNo);
        }
        // Read from the same append-only repository used by the general journal so the
        // account view cannot diverge from entries visible in the journal.
        var entries = transactionRepository.findByFdAccountNoOrderByTxnTimestampAscTxnIdAsc(fdAccountNo);
        if (entries.isEmpty()) {
            // Keep the account view in sync with the journal even if a legacy account
            // number was stored with unexpected whitespace or casing.
            String normalizedAccountNo = fdAccountNo.trim();
            entries = transactionRepository.findAllByOrderByTxnTimestampAscTxnIdAsc().stream()
                    .filter(transaction -> normalizedAccountNo.equalsIgnoreCase(transaction.getFdAccountNo().trim()))
                    .toList();
        }
        List<FDTransactionResponse> transactions = entries.stream().map(FDTransactionResponse::from).toList();
        return ResponseEntity.ok(transactions);
    }

    /**
     * Get account details for a specific FD account
     */
    @GetMapping("/{fdAccountNo}")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN','CUSTOMER')")
    public ResponseEntity<LedgerAccountResponse> getAccountDetails(
            @PathVariable String fdAccountNo) {
        
        FixedDepositAccount account = accountRepository.findById(fdAccountNo)
                .orElseThrow(() -> new IllegalArgumentException("FD account not found: " + fdAccountNo));
        
        return ResponseEntity.ok(LedgerAccountResponse.from(account));
    }
}
