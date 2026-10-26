package com.example.fdmodule.dto;

import com.example.fdmodule.entity.FixedDepositAccount;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for FD account summary in ledger search results
 */
public record LedgerAccountResponse(
        String fdAccountNo,
        String customerId,
        String applicantFullName,
        String applicantFirstName,
        String applicantLastName,
        String productCode,
        BigDecimal principalAmount,
        BigDecimal interestRate,
        Integer tenureMonths,
        String currency,
        String status,
        String approvalStatus,
        LocalDate maturityDate,
        BigDecimal accruedInterest,
        LocalDateTime createdAt,
        String createdBy
) {
    public static LedgerAccountResponse from(FixedDepositAccount account) {
        return new LedgerAccountResponse(
                account.getFdAccountNo(),
                account.getCustomerId(),
                account.getApplicantFullName(),
                account.getApplicantFirstName(),
                account.getApplicantLastName(),
                account.getProductCode(),
                account.getPrincipalAmount(),
                account.getInterestRate(),
                account.getTenureMonths(),
                account.getCurrency(),
                account.getStatus(),
                account.getApprovalStatus(),
                account.getMaturityDate(),
                account.getAccruedInterest(),
                account.getCreatedAt(),
                account.getCreatedBy()
        );
    }
}
