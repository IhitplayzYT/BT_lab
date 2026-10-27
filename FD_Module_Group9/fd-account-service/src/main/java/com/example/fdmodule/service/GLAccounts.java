package com.example.fdmodule.service;

/**
 * Lab 16 / Lab General - internal General Ledger (GL) accounts used by the FD module.
 *
 * <p>The team ER diagram stores GL accounts as VARCHAR(50) codes directly on each
 * {@code fd_transactions} row ({@code debit_gl_account}, {@code credit_gl_account}); there is
 * no GL master table. One ledger row is therefore one balanced double entry: the same
 * amount is debited from one internal account and credited to another.
 *
 * <p>These codes are a shared team contract. Other lifecycle postings must reuse them, e.g.
 * the Lab Manual L19 maturity payout "Debit: FD Liabilities GL" must debit
 * {@link #LIABILITY_FD_DEPOSITS}.
 */
public final class GLAccounts {

    /**
     * Asset / clearing account representing funds received from the customer to open the
     * FD. Debited on the initial deposit. (The L13 request carries no funding-source account,
     * so a single internal remittance account is used.)
     */
    public static final String ASSET_CUSTOMER_REMITTANCE = "ASSET_CUSTOMER_REMITTANCE";

    /**
     * Liability account representing the bank's obligation to repay FD principal
     * (the Lab Manual's "FD Liabilities GL"). Credited on the initial deposit.
     */
    public static final String LIABILITY_FD_DEPOSITS = "LIABILITY_FD_DEPOSITS";

    /**
     * Interest expense, recognized when interest accrues.
     */
    public static final String EXPENSE_INTEREST = "EXPENSE_INTEREST";

    /** Liability for interest earned by customers but not yet capitalized or paid. */
    public static final String LIABILITY_INTEREST_PAYABLE = "LIABILITY_INTEREST_PAYABLE";

    /**
     * Clearing account for money paid out to the customer (interest payouts, maturity payouts).
     * Stands in for the customer's savings account until a payment-service contract exists.
     */
    public static final String ASSET_CUSTOMER_SETTLEMENT = "ASSET_CUSTOMER_SETTLEMENT";

    /** Income from premature-withdrawal penalties (L20). Credited when an FD is closed early. */
    public static final String INCOME_PREMATURE_PENALTY = "INCOME_PREMATURE_PENALTY";

    private GLAccounts() {
    }
}
