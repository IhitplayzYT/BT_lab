-- =====================================================================
-- Local test setup for fd-module-l16 (stand-in for the missing
-- sql/l12_l13_setup.sql). Creates the L12/L13 tables so they match the JPA
-- entities FixedDepositAccount, Product and CustomerProfile exactly
-- (spring.jpa.hibernate.ddl-auto=validate), and seeds the FDSTD product and
-- the CUST001 customer only when they are absent.
--
-- Non-destructive: CREATE ... IF NOT EXISTS and INSERT ... only when absent.
-- Run BEFORE sql/l16_fd_transactions.sql.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS banking_technology_lab;
USE banking_technology_lab;

-- entity/Product.java
CREATE TABLE IF NOT EXISTS products (
    product_code              VARCHAR(10)   NOT NULL,
    product_name              VARCHAR(255)  NULL,
    product_type              VARCHAR(255)  NULL,
    currency                  VARCHAR(3)    NULL,
    effective_date            DATE          NULL,
    min_term_months           INT           NULL,
    max_term_months           INT           NULL,
    min_rate                  DECIMAL(5,2)  NULL,
    max_rate                  DECIMAL(5,2)  NULL,
    min_deposit               DECIMAL(18,2) NULL,
    rate_cap_addon            DECIMAL(5,2)  NULL,
    pre_maturity_penalty_pct  DECIMAL(5,2)  NULL,
    compounding_frequency     VARCHAR(255)  NULL,
    status                    VARCHAR(255)  NULL,
    created_at                DATETIME(6)   NULL,
    created_by                VARCHAR(255)  NULL,
    PRIMARY KEY (product_code)
);

-- entity/CustomerProfile.java
CREATE TABLE IF NOT EXISTS customer_profile (
    customer_id         VARCHAR(20)   NOT NULL,
    user_id             BIGINT        NULL,
    full_name           VARCHAR(255)  NULL,
    phone               VARCHAR(255)  NULL,
    address             VARCHAR(255)  NULL,
    pii_masked_aadhaar  VARCHAR(255)  NULL,
    category            VARCHAR(255)  NULL,
    created_at          DATETIME(6)   NULL,
    PRIMARY KEY (customer_id)
);

-- entity/FixedDepositAccount.java
CREATE TABLE IF NOT EXISTS fd_accounts (
    fd_account_no          VARCHAR(20)   NOT NULL,
    customer_id            VARCHAR(20)   NOT NULL,
    product_code           VARCHAR(10)   NOT NULL,
    currency               VARCHAR(3)    NULL,
    principal_amount       DECIMAL(18,2) NOT NULL,
    interest_rate          DECIMAL(5,2)  NOT NULL,
    customer_category      VARCHAR(50)   NULL,
    account_holder_roles   VARCHAR(100)  NULL,
    co_owner_name          VARCHAR(255)  NULL,
    tenure_months          INT           NULL,
    compounding_frequency  VARCHAR(255)  NULL,
    status                 VARCHAR(20)   NULL,
    maturity_date          DATE          NULL,
    accrued_interest       DECIMAL(18,2) NULL,
    created_at             DATETIME(6)   NULL,
    created_by             VARCHAR(255)  NULL,
    modified_at            DATETIME(6)   NULL,
    uuid                   VARCHAR(255)  NULL,
    PRIMARY KEY (fd_account_no)
);

-- Seed data (inserted only when absent)
INSERT INTO products (product_code, product_name, product_type, currency, effective_date,
                      min_term_months, max_term_months, min_rate, max_rate, min_deposit,
                      rate_cap_addon, pre_maturity_penalty_pct, compounding_frequency,
                      status, created_at, created_by)
SELECT 'FDSTD', 'Standard Fixed Deposit', 'FD', 'INR', '2025-01-01',
       6, 36, 6.50, 8.50, 10000.00,
       2.00, 1.00, 'QUARTERLY',
       'ACTIVE', NOW(6), 'local_test_setup'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_code = 'FDSTD');

INSERT INTO customer_profile (customer_id, user_id, full_name, phone, address,
                              pii_masked_aadhaar, category, created_at)
SELECT 'CUST001', NULL, 'Test Customer One', '9999999999', 'Test Address',
       'XXXX-XXXX-0001', 'REGULAR', NOW(6)
WHERE NOT EXISTS (SELECT 1 FROM customer_profile WHERE customer_id = 'CUST001');
