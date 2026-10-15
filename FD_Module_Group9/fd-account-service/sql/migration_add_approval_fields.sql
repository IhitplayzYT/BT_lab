-- Migration script to add approval workflow fields to fd_accounts table
-- Run this after the initial schema setup

USE fd_group9;

-- Add approval status column
ALTER TABLE fd_accounts 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'PENDING_APPROVAL';

-- Add approved by column
ALTER TABLE fd_accounts 
ADD COLUMN IF NOT EXISTS approved_by VARCHAR(50);

-- Add approved at column
ALTER TABLE fd_accounts 
ADD COLUMN IF NOT EXISTS approved_at DATETIME;

-- Add rejection reason column
ALTER TABLE fd_accounts 
ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(500);

-- Update existing records to have APPROVED status (for backward compatibility)
UPDATE fd_accounts 
SET approval_status = 'APPROVED', 
    status = 'ACTIVE'
WHERE approval_status IS NULL OR approval_status = 'PENDING_APPROVAL';

-- Add index on approval_status for faster queries
CREATE INDEX IF NOT EXISTS idx_approval_status ON fd_accounts(approval_status);
