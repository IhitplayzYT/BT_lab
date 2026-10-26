-- Run AFTER l12_l13_setup.sql, l16_fd_transactions.sql, l14_l17_interest.sql (docker compose does this automatically on a NEW volume).
USE banking_technology_lab;

-- Business-date offset used by the L20 time-travel hook (see BusinessClock).
CREATE TABLE IF NOT EXISTS business_clock (
    id         INT NOT NULL PRIMARY KEY,
    day_offset INT NOT NULL DEFAULT 0
);
INSERT IGNORE INTO business_clock (id, day_offset) VALUES (1, 0);

-- Give demo customer CUST001 a login record with an e-mail address, so FdCreated events carry contact details.
-- !!! Replace the e-mail with FYOUR OWN address to receive the real e-mail in the demo:
--     UPDATE users SET email = 'you@example.com' WHERE username = 'customer1';
INSERT IGNORE INTO users (username, password_hash, email, role)
VALUES ('customer1', 'not-used-login-is-in-memory', 'customer1@example.com', 'CUSTOMER');
INSERT IGNORE INTO customer_profile (customer_id, full_name, phone, category)
VALUES ('CUST001', 'Test Customer', '9999999999', 'GENERAL');
UPDATE customer_profile
   SET user_id = (SELECT id FROM users WHERE username = 'customer1')
 WHERE customer_id = 'CUST001';
