-- Migration script to add approval workflow fields to fd_accounts table
-- Run this after the initial schema setup for existing databases
-- This uses MySQL 8 compatible syntax (no IF NOT EXISTS for ALTER TABLE)

USE banking_technology_lab;

-- Add approval status column (without default to avoid affecting existing rows)
ALTER TABLE fd_accounts 
ADD COLUMN approval_status VARCHAR(20);

-- Add approved by column
ALTER TABLE fd_accounts 
ADD COLUMN approved_by VARCHAR(50);

-- Add approved at column
ALTER TABLE fd_accounts 
ADD COLUMN approved_at DATETIME;

-- Add rejection reason column
ALTER TABLE fd_accounts 
ADD COLUMN rejection_reason VARCHAR(500);

-- Add nominee name column
ALTER TABLE fd_accounts 
ADD COLUMN nominee_name VARCHAR(255);

-- Add nominee relation column
ALTER TABLE fd_accounts 
ADD COLUMN nominee_relation VARCHAR(50);

-- Add applicant details columns
ALTER TABLE fd_accounts 
ADD COLUMN applicant_full_name VARCHAR(255);

ALTER TABLE fd_accounts 
ADD COLUMN applicant_email VARCHAR(255);

ALTER TABLE fd_accounts 
ADD COLUMN applicant_phone VARCHAR(20);

ALTER TABLE fd_accounts 
ADD COLUMN applicant_pan VARCHAR(20);

ALTER TABLE fd_accounts 
ADD COLUMN applicant_account_number VARCHAR(50);

ALTER TABLE fd_accounts 
ADD COLUMN applicant_ifsc VARCHAR(20);

-- Update existing records to have APPROVED approval_status only
-- Do NOT touch the status column to avoid reopening matured/closed FDs
UPDATE fd_accounts 
SET approval_status = 'APPROVED'
WHERE approval_status IS NULL;

-- Add index on approval_status for faster queries
CREATE INDEX idx_approval_status ON fd_accounts(approval_status);
