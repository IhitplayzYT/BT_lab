package com.example.fdmodule.dto;

/**
 * Lab 16 - response of {@code POST /api/fd/account/create-with-txn}.
 *
 * <p>The first three fields are exactly the Lab Manual L16 section 6.2 contract.
 * {@code transactionHistoryUrl} is an additive field: this is a backend-only module, so the
 * "success view + transaction-history link" deliverable is expressed as a link in the API
 * response that a client can follow directly.
 */
public record FDAccountCreationResponse(
        String fdAccountNo,
        Long initialTransactionId,
        String message,
        String transactionHistoryUrl
) {}
