-- DDL for Banking Product & Pricing Schema (Lab L5, L9, L13)

-- =========================================
-- 1. PRODUCTS (core / basic info & limits)
-- =========================================
CREATE TABLE IF NOT EXISTS products (
    productId                INT AUTO_INCREMENT PRIMARY KEY,
    productCode              VARCHAR(50)  NOT NULL UNIQUE,   -- e.g. 'FD001'
    productName              VARCHAR(100) NOT NULL,          -- e.g. 'Fixed Deposit - Short Term'
    productType              VARCHAR(20)  NOT NULL,          -- e.g. 'FD', 'TD', 'CASA', 'LOAN', 'SAVINGS'
    currency                 VARCHAR(10)  NOT NULL,          -- ISO code, e.g. 'INR', 'USD'
    effectiveDate            DATE         NOT NULL,
    endDate                  DATE         DEFAULT NULL,
    isActive                 BOOLEAN      DEFAULT TRUE,
    status                   VARCHAR(20)  DEFAULT 'ACTIVE',  -- DRAFT, ACTIVE, SUSPENDED, RETIRED, INACTIVE
    interestType             VARCHAR(10)  DEFAULT 'CREDIT',  -- CREDIT for deposits, DEBIT for loans
    minAge                   INT          DEFAULT NULL,
    minDeposit               DECIMAL(15,2) DEFAULT NULL,
    maxDeposit               DECIMAL(15,2) DEFAULT NULL,
    minWithdrawal            DECIMAL(15,2) DEFAULT NULL,
    maxWithdrawal            DECIMAL(15,2) DEFAULT NULL,
    allowedTransactionTypes  VARCHAR(255) DEFAULT NULL,
    balanceTypes             VARCHAR(255) DEFAULT NULL,
    -- Audit columns (exact match to specification)
    created_at               TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
                                          ON UPDATE CURRENT_TIMESTAMP,
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
    INDEX idx_products_type (productType),
    INDEX idx_products_status (status),
    INDEX idx_products_effective_date (effectiveDate)
);

-- =========================================
-- 2. PRODUCT BUSINESS RULES (term & rate limits)
-- =========================================
CREATE TABLE IF NOT EXISTS productBusinessRules (
    ruleId          INT AUTO_INCREMENT PRIMARY KEY,
    productId       INT NOT NULL,
    termLimitMin    INT NOT NULL,          -- months, e.g. 3
    termLimitMax    INT NOT NULL,          -- months, e.g. 36
    rateLimitMin    DECIMAL(5,2) NOT NULL, -- e.g. 5.00
    rateLimitMax    DECIMAL(5,2) NOT NULL, -- e.g. 7.50
    transactionType VARCHAR(30),           -- optional, e.g. 'deposit', 'withdrawal'
    CONSTRAINT fk_rules_product
        FOREIGN KEY (productId) REFERENCES products(productId)
        ON DELETE CASCADE
);

-- =========================================
-- 3. PRODUCT CHARGES (1:many)
-- =========================================
CREATE TABLE IF NOT EXISTS productCharges (
    chargeId        INT AUTO_INCREMENT PRIMARY KEY,
    productId       INT NOT NULL,
    chargeType      VARCHAR(30) NOT NULL,   -- 'interestCredit', 'tax', 'withdrawalFee'
    chargeValue     DECIMAL(10,2) NOT NULL, -- amount or percentage value
    chargeUnit      VARCHAR(10) NOT NULL,   -- 'flat' or 'percentage'
    feeType         VARCHAR(30) DEFAULT 'PERIODIC', -- 'PERIODIC', 'ONE_TIME', 'EVENT_BASED'
    CONSTRAINT fk_charges_product
        FOREIGN KEY (productId) REFERENCES products(productId)
        ON DELETE CASCADE
);

-- =========================================
-- 4. PRODUCT ROLES (1:many)
-- =========================================
CREATE TABLE IF NOT EXISTS productRoles (
    roleId          INT AUTO_INCREMENT PRIMARY KEY,
    productId       INT NOT NULL,
    roleType        VARCHAR(20) NOT NULL,   -- 'owner', 'co-owner', 'nominee'
    isMandatory     BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_roles_product
        FOREIGN KEY (productId) REFERENCES products(productId)
        ON DELETE CASCADE
);

-- =========================================
-- 5. PRODUCT RATE VARIATIONS (by Customer Category)
-- =========================================
CREATE TABLE IF NOT EXISTS product_rate_variations (
    productId         INT NOT NULL,
    customer_category VARCHAR(50) NOT NULL,  -- 'SENIOR_CITIZEN', 'EMPLOYEE', 'GENERAL'
    rate_modifier     DECIMAL(5,2) NOT NULL, -- e.g. 1.00, 0.50
    CONSTRAINT fk_rate_variations_product
        FOREIGN KEY (productId) REFERENCES products(productId)
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
