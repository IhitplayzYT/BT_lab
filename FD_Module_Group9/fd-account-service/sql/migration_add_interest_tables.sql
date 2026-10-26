USE banking_technology_lab;

-- Interest tables are JDBC-managed, so Hibernate's ddl-auto=validate will not
-- detect them when an existing MySQL volume skipped its init scripts.
CREATE TABLE IF NOT EXISTS fd_interest_state (
    fd_account_no VARCHAR(20) PRIMARY KEY,
    interest_mode VARCHAR(20) NOT NULL,
    current_balance DECIMAL(18,2) NOT NULL,
    accrued_precise DECIMAL(18,6) NOT NULL,
    last_accrual_date DATE NULL,
    next_capitalization_date DATE NOT NULL,
    CONSTRAINT fk_interest_state_account FOREIGN KEY (fd_account_no) REFERENCES fd_accounts(fd_account_no),
    CONSTRAINT chk_interest_mode CHECK (interest_mode IN ('SIMPLE','MONTHLY_COMPOUND'))
);

CREATE TABLE IF NOT EXISTS fd_interest_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fd_account_no VARCHAR(20) NOT NULL,
    accrual_date DATE NOT NULL,
    interest_amount DECIMAL(18,6) NOT NULL,
    cumulative_interest DECIMAL(18,6) NOT NULL,
    capitalized_flag BOOLEAN NOT NULL DEFAULT FALSE,
    settlement_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    CONSTRAINT uk_interest_account_date UNIQUE (fd_account_no, accrual_date),
    CONSTRAINT fk_interest_account FOREIGN KEY (fd_account_no) REFERENCES fd_accounts(fd_account_no)
);

CREATE TABLE IF NOT EXISTS processed_interest_requests (
    request_id VARCHAR(36) PRIMARY KEY,
    processed_at TIMESTAMP NOT NULL
);
