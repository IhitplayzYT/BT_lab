-- =====================================================================
-- Backfill Historical Transactions for Journal and Ledger
-- This script adds DEPOSIT transactions for existing FD accounts
-- that were created before the fd_transactions table was implemented
-- =====================================================================

USE banking_technology_lab;

-- Insert DEPOSIT transactions for all existing FD accounts that don't have one yet
INSERT INTO fd_transactions (
    fd_account_no,
    txn_type,
    amount,
    currency,
    debit_gl_account,
    credit_gl_account,
    status,
    remarks,
    uuid,
    created_by,
    txn_timestamp,
    created_at
)
SELECT 
    f.fd_account_no,
    'DEPOSIT',
    f.principal_amount,
    COALESCE(f.currency, 'INR'),
    'ASSET_CUSTOMER_REMITTANCE',
    'LIABILITY_FD_DEPOSITS',
    'POSTED',
    CONCAT('Initial deposit for FD account ', f.fd_account_no),
    UUID(),
    'system_backfill',
    f.created_at,
    f.created_at
FROM fd_accounts f
WHERE f.fd_account_no NOT IN (
    SELECT DISTINCT fd_account_no FROM fd_transactions WHERE txn_type = 'DEPOSIT'
);

-- Verify the backfill
SELECT 
    'Total FD accounts' as metric,
    COUNT(*) as value
FROM fd_accounts
UNION ALL
SELECT 
    'FD accounts with DEPOSIT transactions' as metric,
    COUNT(DISTINCT fd_account_no) as value
FROM fd_transactions
WHERE txn_type = 'DEPOSIT'
UNION ALL
SELECT 
    'Total transactions in journal' as metric,
    COUNT(*) as value
FROM fd_transactions;
