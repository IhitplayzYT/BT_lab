-- Insert Dummy Products (Lab L5, L9, L13)
INSERT INTO products (product_code, product_name, product_type, currency, effective_date, is_active, status, interest_type, min_age, min_deposit, max_deposit, min_withdrawal, max_withdrawal, allowed_transaction_types, balance_types, ooo_user_id, ooo_ws_id, ooo_local_ts, ooo_host_ts, rule_system_id, ldbid, ooo_acpt_ts, ooo_acpt_ts_utc_ofst, uuid) VALUES 
('FD001', 'Fixed Deposit - Short Term', 'FD', 'INR', '2025-07-01', TRUE, 'ACTIVE', 'CREDIT', 18, 5000.00, 10000000.00, 0.00, 10000000.00, 'DEPOSIT,CLOSURE', 'AVAILABLE,MATURITY', 'SYSTEM', 'DEFAULT', NOW(), NOW(), 'RULES_SYS', 1, NOW(), '+05:30', UUID()),
('SAV001', 'Savings Account Premium', 'SAVINGS', 'INR', '2025-01-01', TRUE, 'ACTIVE', 'CREDIT', 18, 1000.00, 5000000.00, 100.00, 500000.00, 'DEPOSIT,WITHDRAWAL,TRANSFER', 'AVAILABLE,LEDGER', 'SYSTEM', 'DEFAULT', NOW(), NOW(), 'RULES_SYS', 1, NOW(), '+05:30', UUID()),
('FD002', 'Fixed Deposit - High Yield', 'FD', 'USD', '2025-09-15', TRUE, 'ACTIVE', 'CREDIT', 18, 1000.00, 500000.00, 0.00, 500000.00, 'DEPOSIT,CLOSURE', 'AVAILABLE,MATURITY', 'SYSTEM', 'DEFAULT', NOW(), NOW(), 'RULES_SYS', 1, NOW(), '+05:30', UUID()),
('LN001', 'Unsecured Personal Loan', 'LOAN', 'INR', '2025-03-01', TRUE, 'ACTIVE', 'DEBIT', 21, 50000.00, 1500000.00, 50000.00, 1500000.00, 'DISBURSEMENT,REPAYMENT', 'OUTSTANDING,PRINCIPAL', 'SYSTEM', 'DEFAULT', NOW(), NOW(), 'RULES_SYS', 1, NOW(), '+05:30', UUID());

-- Insert Product Business Rules
INSERT INTO product_business_rules (product_id, term_limit_min, term_limit_max, rate_limit_min, rate_limit_max, transaction_type) VALUES
((SELECT product_id FROM products WHERE product_code = 'FD001'), 3, 36, 5.50, 7.50, 'DEPOSIT'),
((SELECT product_id FROM products WHERE product_code = 'SAV001'), 1, 120, 3.50, 4.50, 'DEPOSIT'),
((SELECT product_id FROM products WHERE product_code = 'FD002'), 12, 60, 4.00, 5.50, 'DEPOSIT'),
((SELECT product_id FROM products WHERE product_code = 'LN001'), 12, 60, 10.50, 15.00, 'DISBURSEMENT');

-- Insert Product Charges
INSERT INTO product_charges (product_id, charge_type, charge_value, charge_unit, fee_type) VALUES
((SELECT product_id FROM products WHERE product_code = 'FD001'), 'interestCredit', 0.00, 'flat', 'PERIODIC'),
((SELECT product_id FROM products WHERE product_code = 'FD001'), 'tax', 10.00, 'percentage', 'EVENT_BASED'),
((SELECT product_id FROM products WHERE product_code = 'FD001'), 'withdrawalFee', 1.00, 'percentage', 'EVENT_BASED'),

((SELECT product_id FROM products WHERE product_code = 'SAV001'), 'interestCredit', 0.00, 'flat', 'PERIODIC'),
((SELECT product_id FROM products WHERE product_code = 'SAV001'), 'tax', 0.00, 'percentage', 'EVENT_BASED'),
((SELECT product_id FROM products WHERE product_code = 'SAV001'), 'withdrawalFee', 0.00, 'flat', 'EVENT_BASED'),

((SELECT product_id FROM products WHERE product_code = 'FD002'), 'interestCredit', 0.00, 'flat', 'PERIODIC'),
((SELECT product_id FROM products WHERE product_code = 'FD002'), 'tax', 10.00, 'percentage', 'EVENT_BASED'),
((SELECT product_id FROM products WHERE product_code = 'FD002'), 'withdrawalFee', 2.00, 'percentage', 'EVENT_BASED'),

((SELECT product_id FROM products WHERE product_code = 'LN001'), 'processingFee', 1.50, 'percentage', 'ONE_TIME'),
((SELECT product_id FROM products WHERE product_code = 'LN001'), 'latePaymentPenalty', 2.00, 'percentage', 'EVENT_BASED');

-- Insert Product Roles
INSERT INTO product_roles (product_id, role_type, is_mandatory) VALUES
((SELECT product_id FROM products WHERE product_code = 'FD001'), 'owner', TRUE),
((SELECT product_id FROM products WHERE product_code = 'FD001'), 'co-owner', FALSE),
((SELECT product_id FROM products WHERE product_code = 'FD001'), 'nominee', FALSE),

((SELECT product_id FROM products WHERE product_code = 'SAV001'), 'owner', TRUE),
((SELECT product_id FROM products WHERE product_code = 'SAV001'), 'co-owner', FALSE),

((SELECT product_id FROM products WHERE product_code = 'FD002'), 'owner', TRUE),
((SELECT product_id FROM products WHERE product_code = 'FD002'), 'nominee', FALSE),

((SELECT product_id FROM products WHERE product_code = 'LN001'), 'borrower', TRUE),
((SELECT product_id FROM products WHERE product_code = 'LN001'), 'guarantor', FALSE);

-- Insert Product Rate Variations
INSERT INTO product_rate_variations (product_id, customer_category, rate_modifier) VALUES
((SELECT product_id FROM products WHERE product_code = 'FD001'), 'SENIOR_CITIZEN', 1.00),
((SELECT product_id FROM products WHERE product_code = 'FD001'), 'EMPLOYEE', 0.50),
((SELECT product_id FROM products WHERE product_code = 'FD001'), 'CORPORATE', 0.20),

((SELECT product_id FROM products WHERE product_code = 'FD002'), 'SENIOR_CITIZEN', 0.75),
((SELECT product_id FROM products WHERE product_code = 'FD002'), 'EMPLOYEE', 0.50);

-- Insert Dummy FD Calculations History
INSERT INTO fd_calculations (principal, term_value, term_unit, product_code, effective_rate, interest_type, maturity_amount, interest_earned, currency, calculation_date, ooo_user_id, ooo_ws_id, ooo_local_ts, ooo_host_ts, rule_system_id, ldbid, ooo_acpt_ts, ooo_acpt_ts_utc_ofst, uuid) VALUES
(100000.00, 12, 'months', 'FD001', 7.00, 'SIMPLE', 107000.00, 7000.00, 'INR', DATE_SUB(NOW(), INTERVAL 2 HOUR), 'SYSTEM', 'DEFAULT', NOW(), NOW(), 'RULES_SYS', 1, NOW(), '+05:30', UUID()),
(50000.00, 36, 'months', 'SAV001', 4.25, 'COMPOUND', 56667.24, 6667.24, 'INR', DATE_SUB(NOW(), INTERVAL 1 DAY), 'SYSTEM', 'DEFAULT', NOW(), NOW(), 'RULES_SYS', 1, NOW(), '+05:30', UUID()),
(250000.00, 24, 'months', 'FD002', 6.25, 'COMPOUND', 282464.38, 32464.38, 'USD', DATE_SUB(NOW(), INTERVAL 2 DAY), 'SYSTEM', 'DEFAULT', NOW(), NOW(), 'RULES_SYS', 1, NOW(), '+05:30', UUID()),
(80000.00, 6, 'months', 'FD001', 6.50, 'SIMPLE', 82600.00, 2600.00, 'INR', DATE_SUB(NOW(), INTERVAL 3 DAY), 'SYSTEM', 'DEFAULT', NOW(), NOW(), 'RULES_SYS', 1, NOW(), '+05:30', UUID());
