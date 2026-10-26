package com.example.fdmodule.controller;

import com.example.fdmodule.dto.FDTransactionResponse;
import com.example.fdmodule.entity.FDTransaction;
import com.example.fdmodule.repository.FDTransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Journal Controller - Provides access to the general journal (all transactions across all FD accounts)
 * for bank officers to review the complete transaction history.
 */
@RestController
@RequestMapping("/api/fd/journal")
public class JournalController {

    private final FDTransactionRepository transactionRepository;

    public JournalController(FDTransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    /**
     * Get all transactions in the general journal (chronological order)
     * Only accessible by BANK_OFFICER and ADMIN roles
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public ResponseEntity<List<FDTransactionResponse>> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        
        // Get all transactions ordered by timestamp (oldest first)
        List<FDTransaction> allTransactions = transactionRepository.findAllByOrderByTxnTimestampAscTxnIdAsc();
        
        // Apply pagination
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, allTransactions.size());
        
        if (fromIndex >= allTransactions.size()) {
            return ResponseEntity.ok(List.of());
        }
        
        List<FDTransaction> pagedTransactions = allTransactions.subList(fromIndex, toIndex);
        List<FDTransactionResponse> responses = pagedTransactions.stream()
                .map(FDTransactionResponse::from)
                .toList();
        
        return ResponseEntity.ok(responses);
    }

    /**
     * Get transactions filtered by type
     */
    @GetMapping("/by-type")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public ResponseEntity<List<FDTransactionResponse>> getTransactionsByType(
            @RequestParam String txnType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        
        // Get all transactions of the specified type
        List<FDTransaction> filteredTransactions = transactionRepository.findAllByOrderByTxnTimestampAscTxnIdAsc()
                .stream()
                .filter(t -> t.getTxnType().equals(txnType))
                .toList();
        
        // Apply pagination
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, filteredTransactions.size());
        
        if (fromIndex >= filteredTransactions.size()) {
            return ResponseEntity.ok(List.of());
        }
        
        List<FDTransaction> pagedTransactions = filteredTransactions.subList(fromIndex, toIndex);
        List<FDTransactionResponse> responses = pagedTransactions.stream()
                .map(FDTransactionResponse::from)
                .toList();
        
        return ResponseEntity.ok(responses);
    }

    /**
     * Get journal summary statistics
     */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public ResponseEntity<JournalSummary> getJournalSummary() {
        List<FDTransaction> allTransactions = transactionRepository.findAllByOrderByTxnTimestampAscTxnIdAsc();
        
        long totalTransactions = allTransactions.size();
        long totalDeposits = allTransactions.stream()
                .filter(t -> t.getTxnType().equals(FDTransaction.TYPE_DEPOSIT))
                .count();
        long totalInterest = allTransactions.stream()
                .filter(t -> t.getTxnType().equals(FDTransaction.TYPE_INTEREST))
                .count();
        long totalInterestAccruals = allTransactions.stream()
                .filter(t -> t.getTxnType().equals(FDTransaction.TYPE_INTEREST_ACCRUAL))
                .count();
        long totalMaturityPayouts = allTransactions.stream()
                .filter(t -> t.getTxnType().equals(FDTransaction.TYPE_MATURITY_PAYOUT))
                .count();
        long totalPrematureWithdrawals = allTransactions.stream()
                .filter(t -> t.getTxnType().equals(FDTransaction.TYPE_PREMATURE_WITHDRAWAL))
                .count();
        
        JournalSummary summary = new JournalSummary(
                totalTransactions,
                totalDeposits,
                totalInterest,
                totalInterestAccruals,
                totalMaturityPayouts,
                totalPrematureWithdrawals
        );
        
        return ResponseEntity.ok(summary);
    }

    /**
     * Summary record for journal statistics
     */
    public record JournalSummary(
            long totalTransactions,
            long totalDeposits,
            long totalInterest,
            long totalInterestAccruals,
            long totalMaturityPayouts,
            long totalPrematureWithdrawals
    ) {}
}
