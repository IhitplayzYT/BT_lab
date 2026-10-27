package com.example.fdmodule.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Lab 16 - one row of the append-only FD transaction ledger ({@code fd_transactions}).
 *
 * <p>Append-only by design: every column is {@code updatable = false}, there are no
 * setters, and {@code FDTransactionRepository} exposes no update/delete methods.
 * The FD account is referenced by its account number (plain String), following the
 * L12/L13 convention of {@link FixedDepositAccount#getCustomerId()} and
 * {@link FixedDepositAccount#getProductCode()}; the database enforces the foreign key.
 */
@Entity
@Table(name = "fd_transactions")
public class FDTransaction {

    /** Lab Manual L16 transaction type for the opening deposit. */
    public static final String TYPE_DEPOSIT = "DEPOSIT";

    /** Interest capitalized or paid out (L14/L17, and the final interest at L18/L19 maturity). */
    public static final String TYPE_INTEREST = "INTEREST";

    /** Periodic interest expense accrued but not yet capitalized or paid. */
    public static final String TYPE_INTEREST_ACCRUAL = "INTEREST_ACCRUAL";

    /** L18/L19 payout of the deposit balance (principal plus capitalized interest) at maturity. */
    public static final String TYPE_MATURITY_PAYOUT = "MATURITY_PAYOUT";

    /** Premature closure payout of the deposit balance less the penalty (Swagger PREMATURE_WITHDRAWAL). */
    public static final String TYPE_PREMATURE_WITHDRAWAL = "PREMATURE_WITHDRAWAL";

    /** Premature-withdrawal penalty taken from the deposit (Swagger PENALTY_DEBIT). */
    public static final String TYPE_PENALTY_DEBIT = "PENALTY_DEBIT";

    /** Status of a committed ledger entry (industry-standard "posted"; not defined by the Lab Manual). */
    public static final String STATUS_POSTED = "POSTED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "txn_id", updatable = false)
    private Long txnId;

    @Column(name = "fd_account_no", length = 20, nullable = false, updatable = false)
    private String fdAccountNo;

    @Column(name = "txn_type", length = 20, nullable = false, updatable = false)
    private String txnType;

    @Column(name = "amount", precision = 18, scale = 2, nullable = false, updatable = false)
    private BigDecimal amount;

    @Column(name = "currency", length = 3, updatable = false)
    private String currency;

    @Column(name = "debit_gl_account", length = 50, nullable = false, updatable = false)
    private String debitGlAccount;

    @Column(name = "credit_gl_account", length = 50, nullable = false, updatable = false)
    private String creditGlAccount;

    @Column(name = "status", length = 20, nullable = false, updatable = false)
    private String status;

    @Column(name = "txn_timestamp", nullable = false, updatable = false)
    private LocalDateTime txnTimestamp;

    @Column(name = "remarks", length = 500, updatable = false)
    private String remarks;

    @Column(name = "uuid", length = 255, nullable = false, updatable = false)
    private String uuid;

    @Column(name = "created_by", length = 50, updatable = false)
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_by", length = 50, updatable = false)
    private String updatedBy;

    /** Required by JPA. */
    protected FDTransaction() {
    }

    public FDTransaction(String fdAccountNo, String txnType, BigDecimal amount, String currency,
                         String debitGlAccount, String creditGlAccount, String remarks, String createdBy) {
        this.fdAccountNo = fdAccountNo;
        this.txnType = txnType;
        this.amount = amount;
        this.currency = currency;
        this.debitGlAccount = debitGlAccount;
        this.creditGlAccount = creditGlAccount;
        this.remarks = remarks;
        this.createdBy = createdBy;
        this.status = STATUS_POSTED;
    }

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (txnTimestamp == null) txnTimestamp = now;
        if (createdAt == null) createdAt = now;
        if (uuid == null) uuid = UUID.randomUUID().toString();
        if (status == null) status = STATUS_POSTED;
    }

    public Long getTxnId() { return txnId; }
    public String getFdAccountNo() { return fdAccountNo; }
    public String getTxnType() { return txnType; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public String getDebitGlAccount() { return debitGlAccount; }
    public String getCreditGlAccount() { return creditGlAccount; }
    public String getStatus() { return status; }
    public LocalDateTime getTxnTimestamp() { return txnTimestamp; }
    public String getRemarks() { return remarks; }
    public String getUuid() { return uuid; }
    public String getCreatedBy() { return createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getUpdatedBy() { return updatedBy; }
}
