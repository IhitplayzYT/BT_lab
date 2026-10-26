ALTER TABLE fd_accounts
    ADD COLUMN customer_category VARCHAR(50) NULL,
    ADD COLUMN account_holder_roles VARCHAR(100) NULL,
    ADD COLUMN co_owner_name VARCHAR(255) NULL;

UPDATE fd_accounts
SET account_holder_roles = 'OWNER'
WHERE account_holder_roles IS NULL;
