-- =====================================================================
-- Lab 16 - fd_transactions (FD financial transaction ledger)
-- Owner: Anirudh Syam Menon (Group 9 work distribution)
--
-- Run AFTER the L12/L13 setup script (fd_accounts must already exist).
-- The application uses spring.jpa.hibernate.ddl-auto=validate, so this
-- table MUST exist before the application starts.
--
-- Column names and types follow the team ER diagram (repo ER_Diagram.pdf).
-- Where the Lab Manual's L16 sample differs (txn_date, DOUBLE, INT,
-- VARCHAR(255)), the ER wins, consistent with the precedent already set by
-- fd_accounts in the L12/L13 implementation (DECIMAL money, ER names).
--
-- Append-only: application code only INSERTs into this table.
--
-- STEP 2 of 2 - run AFTER sql/l12_l13_setup.sql.
-- =====================================================================

USE banking_technology_lab;

CREATE TABLE IF NOT EXISTS fd_transactions (
    txn_id             BIGINT        NOT NULL AUTO_INCREMENT,
    fd_account_no      VARCHAR(20)   NOT NULL,
    txn_type           VARCHAR(20)   NOT NULL,   -- DEPOSIT (L16); WITHDRAWAL / INTEREST / MATURITY_PAYOUT etc. per Lab Manual
    amount             DECIMAL(18,2) NOT NULL,
    currency           VARCHAR(3)    NULL,       -- copied from fd_accounts.currency
    debit_gl_account   VARCHAR(50)   NOT NULL,   -- double entry: debit leg (see GLAccounts.java)
    credit_gl_account  VARCHAR(50)   NOT NULL,   -- double entry: credit leg
    status             VARCHAR(20)   NOT NULL,   -- POSTED for committed entries
    txn_timestamp      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    remarks            VARCHAR(500)  NULL,
    uuid               VARCHAR(255)  NOT NULL,
    created_by         VARCHAR(50)   NULL,       -- authenticated user who triggered the event
    created_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by         VARCHAR(50)   NULL,       -- in team ER; never set (ledger is append-only)

    -- Technical guard (not a business field): holds fd_account_no only for
    -- DEPOSIT rows, NULL otherwise. The unique key below therefore allows at
    -- most ONE initial DEPOSIT per FD account at database level, while any
    -- number of other transaction types remain allowed.
    deposit_guard      VARCHAR(20) GENERATED ALWAYS AS
                       (CASE WHEN txn_type = 'DEPOSIT' THEN fd_account_no ELSE NULL END) STORED,

    PRIMARY KEY (txn_id),
    UNIQUE KEY uk_fd_txn_uuid (uuid),
    UNIQUE KEY uk_fd_txn_one_deposit (deposit_guard),
    KEY idx_fd_txn_account_time (fd_account_no, txn_timestamp),
    -- Default RESTRICT actions: MySQL forbids CASCADE/SET NULL on base
    -- columns of a stored generated column, and a ledger must never cascade.
    CONSTRAINT fk_fd_txn_account FOREIGN KEY (fd_account_no)
        REFERENCES fd_accounts (fd_account_no),
    CONSTRAINT chk_fd_txn_amount_non_negative CHECK (amount >= 0)
);

-- Lab Manual L16 section 9 equivalent (for manual testing only; the API
-- inserts this row automatically):
-- INSERT INTO fd_transactions (fd_account_no, txn_type, amount, currency,
--     debit_gl_account, credit_gl_account, status, remarks, uuid, created_by)
-- VALUES ('BR0010001235', 'DEPOSIT', 200000.00, 'INR',
--     'ASSET_CUSTOMER_REMITTANCE', 'LIABILITY_FD_DEPOSITS', 'POSTED',
--     'Initial Deposit', UUID(), 'officer1');
