-- =====================================================================
-- Migration: Add Bundle/Package Support for FD Applications
-- =====================================================================
-- This migration adds support for FD bundles/packages where multiple
-- FDs can be grouped together and approved as a single unit by officers.
-- =====================================================================

USE banking_technology_lab;

-- Add bundle fields to fd_accounts table. These checks let the migration run
-- both on databases created from the current base schema and on older volumes.
SET @add_bundle_id = IF(
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = 'fd_accounts' AND column_name = 'bundle_id') = 0,
    'ALTER TABLE fd_accounts ADD COLUMN bundle_id VARCHAR(50) NULL AFTER customer_id',
    'SELECT 1'
);
PREPARE stmt FROM @add_bundle_id;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_bundle_name = IF(
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = 'fd_accounts' AND column_name = 'bundle_name') = 0,
    'ALTER TABLE fd_accounts ADD COLUMN bundle_name VARCHAR(255) NULL AFTER bundle_id',
    'SELECT 1'
);
PREPARE stmt FROM @add_bundle_name;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_bundle_index = IF(
    (SELECT COUNT(*) FROM information_schema.statistics
     WHERE table_schema = DATABASE() AND table_name = 'fd_accounts' AND index_name = 'idx_fd_accounts_bundle') = 0,
    'CREATE INDEX idx_fd_accounts_bundle ON fd_accounts (bundle_id)',
    'SELECT 1'
);
PREPARE stmt FROM @add_bundle_index;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create bundle_applications table to track bundle-level status
CREATE TABLE IF NOT EXISTS bundle_applications (
    bundle_id          VARCHAR(50)   NOT NULL,
    customer_id        VARCHAR(20)   NOT NULL,
    bundle_name        VARCHAR(255)  NOT NULL,
    bundle_description TEXT          NULL,
    total_amount       DECIMAL(18,2) NOT NULL,
    estimated_return   DECIMAL(18,2) NULL,
    status             VARCHAR(20)   NOT NULL DEFAULT 'PENDING_APPROVAL',
    approval_status    VARCHAR(20)   NOT NULL DEFAULT 'PENDING_APPROVAL',
    approved_by        VARCHAR(50)   NULL,
    approved_at        TIMESTAMP     NULL,
    rejection_reason   VARCHAR(500)  NULL,
    created_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at        TIMESTAMP     NULL,
    PRIMARY KEY (bundle_id),
    KEY idx_bundle_applications_customer (customer_id),
    KEY idx_bundle_applications_status (status)
);

-- Create bundle_items table to track individual FDs in a bundle
CREATE TABLE IF NOT EXISTS bundle_items (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    bundle_id       VARCHAR(50)  NOT NULL,
    fd_account_no   VARCHAR(20)  NOT NULL,
    sequence_order INT          NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_bundle_items_fd (fd_account_no),
    KEY idx_bundle_items_bundle (bundle_id),
    CONSTRAINT fk_bundle_items_bundle FOREIGN KEY (bundle_id) REFERENCES bundle_applications(bundle_id) ON DELETE CASCADE,
    CONSTRAINT fk_bundle_items_fd FOREIGN KEY (fd_account_no) REFERENCES fd_accounts(fd_account_no) ON DELETE CASCADE
);
