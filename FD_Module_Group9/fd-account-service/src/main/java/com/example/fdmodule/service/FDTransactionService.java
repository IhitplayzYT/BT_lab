package com.example.fdmodule.service;

import com.example.fdmodule.dto.FDAccountCreationResponse;
import com.example.fdmodule.dto.FDAccountRequest;
import com.example.fdmodule.dto.FDAccountResponse;
import com.example.fdmodule.dto.FDTransactionResponse;
import com.example.fdmodule.entity.FDTransaction;
import com.example.fdmodule.entity.FixedDepositAccount;
import com.example.fdmodule.repository.FDTransactionRepository;
import com.example.fdmodule.repository.FixedDepositAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Lab 16 - FD account creation with initial DEPOSIT transaction logging and GL initialisation.
 *
 * <p>Integration with L12/L13: account creation itself is NOT re-implemented here. This service
 * calls the existing {@link FDAccountService#create(FDAccountRequest, String)} (customer, product,
 * term, deposit and rate validation, account-number generation, {@code fd_accounts} insert) and
 * then records the ledger entry. Both run in ONE database transaction:
 *
 * <pre>
 * createFDAccountWithTransaction   @Transactional (REQUIRED)  &lt;-- transaction boundary
 *   -> FDAccountService.create      @Transactional (REQUIRED, joins)
 *   -> fd_accounts flush            (account row written first, so the FK is satisfied)
 *   -> recordInitialDeposit         @Transactional (MANDATORY, joins)
 *   commit both rows, or roll both back on any RuntimeException
 * </pre>
 */
@Service
public class FDTransactionService {

    static final String INITIAL_DEPOSIT_REMARKS = "Initial Deposit";
    static final String CREATION_MESSAGE = "Account and initial deposit created.";

    private final FDAccountService fdAccountService;
    private final FixedDepositAccountRepository fdRepository;
    private final FDTransactionRepository transactionRepository;
    /** L18: optional (setter injection keeps the existing 3-argument unit test working). */
    private FdCreatedPublisher createdPublisher;

    public FDTransactionService(FDAccountService fdAccountService,
                                FixedDepositAccountRepository fdRepository,
                                FDTransactionRepository transactionRepository) {
        this.fdAccountService = fdAccountService;
        this.fdRepository = fdRepository;
        this.transactionRepository = transactionRepository;
    }

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    void setCreatedPublisher(FdCreatedPublisher createdPublisher) {
        this.createdPublisher = createdPublisher;
    }

    /**
     * Lab Manual L16 section 5.2: create the FD account and its initial DEPOSIT atomically.
     *
     * @return FD account number, initial transaction ID, message and the transaction-history link
     */
    @Transactional
    public FDAccountCreationResponse createFDAccountWithTransaction(FDAccountRequest request, String createdBy) {
        FDAccountResponse created = fdAccountService.create(request, createdBy);

        // Write the pending fd_accounts INSERT now so the fd_transactions foreign key is satisfied
        // and any account-level constraint error surfaces before the ledger row is written.
        fdRepository.flush();

        FixedDepositAccount fd = fdRepository.findById(created.fdAccountNo())
                .orElseThrow(() -> new IllegalStateException(
                        "FD account not found after creation: " + created.fdAccountNo()));

        FDTransaction deposit = recordInitialDeposit(fd, createdBy);

        // L18: FdCreated goes into the outbox in the SAME transaction as the account and its deposit.
        if (createdPublisher != null) {
            createdPublisher.publish(fd, createdBy);
        }

        return new FDAccountCreationResponse(
                fd.getFdAccountNo(),
                deposit.getTxnId(),
                CREATION_MESSAGE,
                transactionHistoryUrl(fd.getFdAccountNo()));
    }

    /**
     * Records the opening DEPOSIT with its double entry:
     * Debit {@link GLAccounts#ASSET_CUSTOMER_REMITTANCE}, Credit {@link GLAccounts#LIABILITY_FD_DEPOSITS},
     * both for the FD principal.
     *
     * <p>Idempotent per FD account: if a DEPOSIT already exists it is returned and nothing new is
     * written (the database also enforces one DEPOSIT per account, see sql/l16_fd_transactions.sql).
     * {@code MANDATORY} propagation: it must run inside the account-creation transaction and fails
     * fast if called without one.
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public FDTransaction recordInitialDeposit(FixedDepositAccount fd, String createdBy) {
        return transactionRepository
                .findFirstByFdAccountNoAndTxnTypeOrderByTxnIdAsc(fd.getFdAccountNo(), FDTransaction.TYPE_DEPOSIT)
                .orElseGet(() -> transactionRepository.save(new FDTransaction(
                        fd.getFdAccountNo(),
                        FDTransaction.TYPE_DEPOSIT,
                        fd.getPrincipalAmount(),
                        fd.getCurrency(),
                        GLAccounts.ASSET_CUSTOMER_REMITTANCE,
                        GLAccounts.LIABILITY_FD_DEPOSITS,
                        INITIAL_DEPOSIT_REMARKS,
                        createdBy)));
    }

    /** Transaction history for one FD account, oldest first. */
    @Transactional(readOnly = true)
    public List<FDTransactionResponse> getTransactions(String fdAccountNo) {
        if (!fdRepository.existsById(fdAccountNo)) {
            throw new IllegalArgumentException("FD account not found: " + fdAccountNo);
        }
        return transactionRepository.findByFdAccountNoOrderByTxnTimestampAscTxnIdAsc(fdAccountNo)
                .stream()
                .map(FDTransactionResponse::from)
                .toList();
    }

    static String transactionHistoryUrl(String fdAccountNo) {
        return "/api/fd/account/" + fdAccountNo + "/transactions";
    }
}
