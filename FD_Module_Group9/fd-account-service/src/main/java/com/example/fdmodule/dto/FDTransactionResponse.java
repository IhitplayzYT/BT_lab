package com.example.fdmodule.dto;

import com.example.fdmodule.entity.FDTransaction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Lab 16 - one entry of {@code GET /api/fd/account/{fdAccountNo}/transactions}. */
public record FDTransactionResponse(
        Long txnId,
        String fdAccountNo,
        String txnType,
        BigDecimal amount,
        String currency,
        String debitGlAccount,
        String creditGlAccount,
        String status,
        LocalDateTime txnTimestamp,
        String remarks,
        String uuid,
        String createdBy
) {
    public static FDTransactionResponse from(FDTransaction t) {
        return new FDTransactionResponse(
                t.getTxnId(), t.getFdAccountNo(), t.getTxnType(), t.getAmount(), t.getCurrency(),
                t.getDebitGlAccount(), t.getCreditGlAccount(), t.getStatus(), t.getTxnTimestamp(),
                t.getRemarks(), t.getUuid(), t.getCreatedBy());
    }
}
