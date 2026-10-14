-- =====================================================================
-- STEP 1 of 2 - Base FD schema (Lab 12/13) + test data
--
-- Vritika's L12/L13 README refers to sql/l12_l13_setup.sql, but that file
-- was not included in the project. This script recreates it from the FD
-- ER diagram ("eer digram fd module.pdf"), matching the JPA entities in
-- src/main/java/com/example/fdmodule/entity exactly, because the app runs
-- with ddl-auto=validate (Hibernate checks the tables, it does not create them).
--
-- Safe to run more than once: nothing is dropped, existing rows are kept.
-- Run this FIRST, then sql/l16_fd_transactions.sql.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS banking_technology_lab;
USE banking_technology_lab;

-- users (ER diagram). Not used by the standalone app (it has in-memory
-- login users), included so customer_profile.user_id has its parent table.
CREATE TABLE IF NOT EXISTS users (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    username       VARCHAR(50)  NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    email          VARCHAR(100) NULL,
    role           VARCHAR(20)  NOT NULL,      -- CUSTOMER / BANK_OFFICER / ADMIN
    created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_username (username)
);

-- customer_profile  ->  entity CustomerProfile
CREATE TABLE IF NOT EXISTS customer_profile (
    customer_id         VARCHAR(20)  NOT NULL,
    user_id             BIGINT       NULL,
    full_name           VARCHAR(255) NULL,
    phone               VARCHAR(20)  NULL,
    address             VARCHAR(255) NULL,
    pii_masked_aadhaar  VARCHAR(20)  NULL,
    category            VARCHAR(50)  NULL,      -- e.g. GENERAL, SENIOR
    created_at          TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (customer_id),
    CONSTRAINT fk_customer_profile_user FOREIGN KEY (user_id) REFERENCES users (id)
);

-- products  ->  entity Product
CREATE TABLE IF NOT EXISTS products (
    product_code              VARCHAR(10)   NOT NULL,
    product_name              VARCHAR(255)  NULL,
    product_type              VARCHAR(20)   NULL,
    interest_type             VARCHAR(20)   NULL,
    currency                  VARCHAR(3)    NULL,
    effective_date            DATE          NULL,
    min_term_months           INT           NULL,
    max_term_months           INT           NULL,
    min_rate                  DECIMAL(5,2)  NULL,
    max_rate                  DECIMAL(5,2)  NULL,
    min_deposit               DECIMAL(18,2) NULL,
    max_deposit               DECIMAL(18,2) NULL,
    rate_cap_addon            DECIMAL(5,2)  NULL,
    pre_maturity_penalty_pct  DECIMAL(5,2)  NULL,
    compounding_frequency     VARCHAR(20)   NULL,
    status                    VARCHAR(20)   NULL,      -- ACTIVE / INACTIVE
    created_at                TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
    created_by                VARCHAR(50)   NULL,
    PRIMARY KEY (product_code)
);

-- fd_accounts  ->  entity FixedDepositAccount
CREATE TABLE IF NOT EXISTS fd_accounts (
    fd_account_no          VARCHAR(20)   NOT NULL,
    customer_id            VARCHAR(20)   NOT NULL,
    product_code           VARCHAR(10)   NOT NULL,
    currency               VARCHAR(3)    NULL,
    principal_amount       DECIMAL(18,2) NOT NULL,
    interest_rate          DECIMAL(5,2)  NOT NULL,
    tenure_months          INT           NULL,
    compounding_frequency  VARCHAR(20)   NULL,
    status                 VARCHAR(20)   NULL,      -- ACTIVE / CLOSED / MATURED
    maturity_date          DATE          NULL,
    accrued_interest       DECIMAL(18,2) NULL,
    created_at             TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
    created_by             VARCHAR(50)   NULL,
    modified_at            TIMESTAMP     NULL,
    uuid                   VARCHAR(255)  NULL,
    PRIMARY KEY (fd_account_no),
    KEY idx_fd_accounts_customer (customer_id),
    CONSTRAINT fk_fd_accounts_product FOREIGN KEY (product_code) REFERENCES products (product_code)
);

-- ---------------------------------------------------------------------
-- Test data (from the L12/L13 report and Lab Manual examples).
-- INSERT IGNORE skips rows that already exist.
-- ---------------------------------------------------------------------
INSERT IGNORE INTO products
    (product_code, product_name, product_type, currency, effective_date,
     min_term_months, max_term_months, min_rate, max_rate, min_deposit,
     rate_cap_addon, pre_maturity_penalty_pct, compounding_frequency, status, created_by)
VALUES
    ('FDSTD', 'Fixed Deposit - Standard', 'FD', 'INR', '2025-01-01',
     6, 36, 6.50, 8.50, 10000.00,
     2.00, 1.00, 'QUARTERLY', 'ACTIVE', 'admin1');

INSERT IGNORE INTO customer_profile (customer_id, full_name, phone, category)
VALUES ('CUST001', 'Test Customer', '9999999999', 'GENERAL');
