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
-- Note: user_id references auth-service users table, not local users table
-- Foreign key constraint removed to support distributed auth
CREATE TABLE IF NOT EXISTS customer_profile (
    customer_id         VARCHAR(20)  NOT NULL,
    user_id             BIGINT       NULL,
    full_name           VARCHAR(255) NULL,
    phone               VARCHAR(20)  NULL,
    address             VARCHAR(255) NULL,
    pii_masked_aadhaar  VARCHAR(20)  NULL,
    category            VARCHAR(50)  NULL,      -- e.g. GENERAL, SENIOR
    created_at          TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (customer_id)
);

-- fd_accounts  ->  entity FixedDepositAccount
CREATE TABLE IF NOT EXISTS fd_accounts (
    fd_account_no          VARCHAR(20)   NOT NULL,
    customer_id            VARCHAR(20)   NOT NULL,
    bundle_id              VARCHAR(50)   NULL,
    bundle_name            VARCHAR(255)  NULL,
    product_code           VARCHAR(50)   NOT NULL,
    currency               VARCHAR(3)    NULL,
    principal_amount       DECIMAL(18,2) NOT NULL,
    interest_rate          DECIMAL(5,2)  NOT NULL,
    tenure_months          INT           NULL,
    compounding_frequency  VARCHAR(20)   NULL,
    status                 VARCHAR(20)   NULL,      -- ACTIVE / CLOSED / MATURED
    approval_status        VARCHAR(20)   NULL,      -- PENDING_APPROVAL / APPROVED / REJECTED
    approved_by            VARCHAR(50)   NULL,
    approved_at            TIMESTAMP     NULL,
    rejection_reason       VARCHAR(500)  NULL,
    nominee_name           VARCHAR(255) NULL,
    nominee_relation       VARCHAR(50)  NULL,
    customer_category      VARCHAR(50)  NULL,
    account_holder_roles   VARCHAR(100) NULL,
    co_owner_name          VARCHAR(255) NULL,
    applicant_full_name    VARCHAR(255) NULL,
    applicant_first_name   VARCHAR(100)  NULL,
    applicant_middle_name  VARCHAR(100)  NULL,
    applicant_last_name    VARCHAR(100)  NULL,
    applicant_age          INT           NULL,
    applicant_gender       VARCHAR(20)   NULL,
    applicant_occupation   VARCHAR(100)  NULL,
    applicant_annual_income DECIMAL(15,2) NULL,
    applicant_address      TEXT          NULL,
    applicant_city         VARCHAR(100)  NULL,
    applicant_state        VARCHAR(100)  NULL,
    applicant_pincode      VARCHAR(10)   NULL,
    applicant_nationality VARCHAR(50)   NULL,
    applicant_marital_status VARCHAR(20)  NULL,
    applicant_email        VARCHAR(255) NULL,
    applicant_phone        VARCHAR(20)  NULL,
    applicant_pan          VARCHAR(20)  NULL,
    applicant_account_number VARCHAR(50) NULL,
    applicant_ifsc         VARCHAR(20)  NULL,
    maturity_date          DATE          NULL,
    accrued_interest       DECIMAL(18,2) NULL,
    created_at             TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
    created_by             VARCHAR(50)   NULL,
    modified_at            TIMESTAMP     NULL,
    uuid                   VARCHAR(255)  NULL,
    PRIMARY KEY (fd_account_no),
    KEY idx_fd_accounts_customer (customer_id),
    KEY idx_fd_accounts_bundle (bundle_id)
);

-- fd_nominees  ->  entity Nominee (for multiple nominees support)
CREATE TABLE IF NOT EXISTS fd_nominees (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    fd_account_no   VARCHAR(20)  NOT NULL,
    nominee_name    VARCHAR(255) NOT NULL,
    nominee_relation VARCHAR(50)  NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_fd_nominees_account (fd_account_no),
    CONSTRAINT fk_fd_nominees_account FOREIGN KEY (fd_account_no) REFERENCES fd_accounts (fd_account_no) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Test data (from the L12/L13 report and Lab Manual examples).
-- INSERT IGNORE skips rows that already exist.
-- ---------------------------------------------------------------------
INSERT IGNORE INTO customer_profile (customer_id, full_name, phone, category)
VALUES ('CUST001', 'Test Customer', '9999999999', 'GENERAL');
