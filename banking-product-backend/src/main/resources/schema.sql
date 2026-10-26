-- DDL for Banking Product & Pricing Schema (Lab L5, L9, L13)

-- Grant permissions to product_user (needed for Docker container access)
GRANT ALL PRIVILEGES ON banking_product_db.* TO 'product_user'@'%';
FLUSH PRIVILEGES;

-- =========================================
-- 1. PRODUCTS (core / basic info & limits)
-- =========================================
CREATE TABLE IF NOT EXISTS products (
    product_id               INT AUTO_INCREMENT PRIMARY KEY,
    product_code             VARCHAR(50)  NOT NULL UNIQUE,   -- e.g. 'FD001'
    product_name             VARCHAR(100) NOT NULL,          -- e.g. 'Fixed Deposit - Short Term'
    product_type             VARCHAR(20)  NOT NULL,          -- e.g. 'FD', 'TD', 'CASA', 'LOAN', 'SAVINGS'
    currency                 VARCHAR(10)  NOT NULL,          -- ISO code, e.g. 'INR', 'USD'
    effective_date           DATE         NOT NULL,
    end_date                 DATE         DEFAULT NULL,
    is_active                BOOLEAN      DEFAULT TRUE,
    status                   VARCHAR(20)  DEFAULT 'ACTIVE',  -- DRAFT, ACTIVE, SUSPENDED, RETIRED, INACTIVE
    interest_type            VARCHAR(10)  DEFAULT 'CREDIT',  -- CREDIT for deposits, DEBIT for loans
    min_age                  INT          DEFAULT NULL,
    min_deposit              DECIMAL(15,2) DEFAULT NULL,
    max_deposit              DECIMAL(15,2) DEFAULT NULL,
    min_withdrawal           DECIMAL(15,2) DEFAULT NULL,
    max_withdrawal           DECIMAL(15,2) DEFAULT NULL,
    allowed_transaction_types VARCHAR(255) DEFAULT NULL,
    balance_types            VARCHAR(255) DEFAULT NULL,
    -- Advanced charge configuration fields
    tax_rate                 DECIMAL(5,2) DEFAULT NULL,     -- Tax rate as percentage
    service_fee_rate         DECIMAL(5,2) DEFAULT NULL,     -- Service fee rate as percentage
    service_fee_flat         DECIMAL(15,2) DEFAULT NULL,   -- Flat service fee amount
    documentation_fee        DECIMAL(15,2) DEFAULT NULL,   -- Documentation fee amount
    gst_rate                 DECIMAL(5,2) DEFAULT NULL,   -- GST rate as percentage, configured per product
    premature_penalty_rate   DECIMAL(5,2) DEFAULT NULL,     -- Premature withdrawal penalty rate, configured per product
    compounding_frequency    VARCHAR(20) DEFAULT 'QUARTERLY',
    -- Audit columns (exact match to specification)
    created_by               VARCHAR(50)  DEFAULT NULL,
    created_at               TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_by               VARCHAR(50)  DEFAULT NULL,
    updated_at               TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version                  INT          DEFAULT 0,
    ldbid                    INT          NOT NULL DEFAULT 1,
    ooo_acpt_ts_utc_ofst     VARCHAR(6)   NOT NULL DEFAULT '+05:30',
    ooo_user_id              VARCHAR(32)  NOT NULL DEFAULT 'SYSTEM',
    ooo_ws_id                VARCHAR(32)  NOT NULL DEFAULT 'DEFAULT',
    rule_system_id           VARCHAR(32)  NOT NULL DEFAULT 'RULES_SYS',
    uuid                     VARCHAR(36)  NOT NULL,
    ooo_acpt_ts              DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ooo_host_ts              DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ooo_local_ts             DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    -- Declared inline: MySQL 8 does not support CREATE INDEX IF NOT EXISTS
    INDEX idx_products_type (product_type),
    INDEX idx_products_status (status),
    INDEX idx_products_effective_date (effective_date)
);

-- =========================================
-- 2. PRODUCT BUSINESS RULES (term & rate limits)
-- =========================================
CREATE TABLE IF NOT EXISTS product_business_rules (
    rule_id          INT AUTO_INCREMENT PRIMARY KEY,
    product_id       INT NOT NULL,
    term_limit_min    INT NOT NULL,          -- months, e.g. 3
    term_limit_max    INT NOT NULL,          -- months, e.g. 36
    rate_limit_min    DECIMAL(5,2) NOT NULL, -- e.g. 5.00
    rate_limit_max    DECIMAL(5,2) NOT NULL, -- e.g. 7.50
    transaction_type VARCHAR(30),           -- optional, e.g. 'deposit', 'withdrawal'
    CONSTRAINT fk_rules_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE
);

-- =========================================
-- 3. PRODUCT CHARGES (1:many)
-- =========================================
CREATE TABLE IF NOT EXISTS product_charges (
    charge_id        INT AUTO_INCREMENT PRIMARY KEY,
    product_id       INT NOT NULL,
    charge_type      VARCHAR(30) NOT NULL,   -- 'interestCredit', 'tax', 'withdrawalFee'
    charge_value     DECIMAL(10,2) NOT NULL, -- amount or percentage value
    charge_unit      VARCHAR(10) NOT NULL,   -- 'flat' or 'percentage'
    fee_type         VARCHAR(30) DEFAULT 'PERIODIC', -- 'PERIODIC', 'ONE_TIME', 'EVENT_BASED'
    CONSTRAINT fk_charges_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE
);

-- =========================================
-- 4. PRODUCT ROLES (1:many)
-- =========================================
CREATE TABLE IF NOT EXISTS product_roles (
    role_id          INT AUTO_INCREMENT PRIMARY KEY,
    product_id       INT NOT NULL,
    role_type        VARCHAR(20) NOT NULL,   -- 'owner', 'co-owner', 'nominee'
    is_mandatory     BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_roles_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE
);

-- =========================================
-- 5. PRODUCT RATE VARIATIONS (by Customer Category)
-- =========================================
CREATE TABLE IF NOT EXISTS product_rate_variations (
    product_id        INT NOT NULL,
    customer_category VARCHAR(50) NOT NULL,  -- 'SENIOR_CITIZEN', 'EMPLOYEE', 'GENERAL'
    rate_modifier     DECIMAL(5,2) NOT NULL, -- e.g. 1.00, 0.50
    CONSTRAINT uk_product_category UNIQUE (product_id, customer_category),
    CONSTRAINT fk_rate_variations_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE
);


-- =========================================
-- 6. FD CALCULATIONS (Audit & History)
-- =========================================
CREATE TABLE IF NOT EXISTS fd_calculations (
    calculation_id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    principal                DECIMAL(15,2) NOT NULL,
    term_value               INT           NOT NULL,
    term_unit                VARCHAR(10)   NOT NULL,
    product_code             VARCHAR(50)   NOT NULL,
    effective_rate           DECIMAL(5,2)  NOT NULL,
    interest_type            VARCHAR(20)   NOT NULL,
    maturity_amount          DECIMAL(15,2) NOT NULL,
    interest_earned          DECIMAL(15,2) NOT NULL,
    currency                 VARCHAR(10)   NOT NULL,
    calculation_date         DATETIME      NOT NULL,
    is_converted             BOOLEAN       DEFAULT FALSE,
    conversion_rate          DOUBLE        DEFAULT NULL,
    -- Audit columns (exact match to specification)
    created_at               TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ldbid                    INT          NOT NULL DEFAULT 1,
    ooo_acpt_ts_utc_ofst     VARCHAR(6)   NOT NULL DEFAULT '+05:30',
    ooo_user_id              VARCHAR(32)  NOT NULL DEFAULT 'SYSTEM',
    ooo_ws_id                VARCHAR(32)  NOT NULL DEFAULT 'DEFAULT',
    rule_system_id           VARCHAR(32)  NOT NULL DEFAULT 'RULES_SYS',
    uuid                     VARCHAR(36)  NOT NULL,
    ooo_acpt_ts              DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ooo_host_ts              DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ooo_local_ts             DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
);
