-- MySQL DDL for FD Calculator audit table
-- Run once on initial deployment (Flyway/Liquibase handles subsequent migrations)

-- Grant permissions to fd_user (needed for Docker container access)
GRANT ALL PRIVILEGES ON fd_calculator.* TO 'fd_user'@'%';
FLUSH PRIVILEGES;

CREATE TABLE IF NOT EXISTS fd_calculation_audit (
    calculation_id          VARCHAR(30)     NOT NULL,
    uuid                    VARCHAR(36)     NOT NULL UNIQUE,
    customer_id             VARCHAR(50)     NOT NULL,
    product_code            VARCHAR(20)     NOT NULL,
    principal               DECIMAL(18, 2)  NOT NULL,
    term_months             INT             NOT NULL,
    base_rate               DECIMAL(6, 2)   NOT NULL,
    effective_rate          DECIMAL(6, 2)   NOT NULL,
    interest_type           VARCHAR(10)     NOT NULL,
    interest_earned         DECIMAL(18, 2)  NOT NULL,
    maturity_amount         DECIMAL(18, 2)  NOT NULL,
    estimated_maturity_date DATE,
    created_at              TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ldbid                   INT             NULL,
    ooo_acpt_ts_utc_ofst    VARCHAR(6)      NULL,
    ooo_user_id             VARCHAR(32)     NULL,
    ooo_ws_id               VARCHAR(32)     NULL,
    rule_system_id          VARCHAR(32)     NULL,
    ooo_acpt_ts             DATETIME(6)     NULL,
    ooo_host_ts             DATETIME(6)     NULL,
    ooo_local_ts            DATETIME(6)     NULL,
    PRIMARY KEY (calculation_id),
    UNIQUE KEY uq_audit_uuid (uuid),
    INDEX idx_customer_id (customer_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
