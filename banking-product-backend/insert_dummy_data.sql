-- Insert 12 Diverse FD Products for Banking Lab
-- Includes: Tax Saver, Senior Citizen, CASA, various tenures and rates

INSERT INTO products (product_code, product_name, product_type, currency, effective_date, is_active, status, interest_type, min_age, min_deposit, max_deposit, min_withdrawal, max_withdrawal, allowed_transaction_types, balance_types, ooo_user_id, ooo_ws_id, ooo_local_ts, ooo_host_ts, rule_system_id, ldbid, ooo_acpt_ts, ooo_acpt_ts_utc_ofst, uuid) VALUES 
-- Product 1: Tax Saver FD (Fixed 5-year tenure, tax benefit under 80C)
('FD_TAX_SAVER', 'Tax Saver Fixed Deposit - 80C Benefit', 'FD', 'INR', CURDATE(), TRUE, 'ACTIVE', 'CREDIT', 18, 10000.00, 150000.00, 0.00, 0.00, 'DEPOSIT,CLOSURE', 'AVAILABLE,MATURITY', 'SYSTEM', 'DEFAULT', NOW(), NOW(), 'RULES_SYS', 1, NOW(), '+05:30', UUID()),

-- Product 2: Senior Citizen FD (Higher rates for 60+)
('FD_SENIOR', 'Senior Citizen Special FD', 'FD', 'INR', CURDATE(), TRUE, 'ACTIVE', 'CREDIT', 60, 5000.00, 10000000.00, 0.00, 10000000.00, 'DEPOSIT,CLOSURE', 'AVAILABLE,MATURITY', 'SYSTEM', 'DEFAULT', NOW(), NOW(), 'RULES_SYS', 1, NOW(), '+05:30', UUID()),

-- Product 3: Short Term FD (3-12 months)
('FD_SHORT', 'Short Term Fixed Deposit', 'FD', 'INR', CURDATE(), TRUE, 'ACTIVE', 'CREDIT', 18, 5000.00, 10000000.00, 0.00, 10000000.00, 'DEPOSIT,CLOSURE', 'AVAILABLE,MATURITY', 'SYSTEM', 'DEFAULT', NOW(), NOW(), 'RULES_SYS', 1, NOW(), '+05:30', UUID()),

-- Product 4: Medium Term FD (1-3 years)
('FD_MEDIUM', 'Medium Term Fixed Deposit', 'FD', 'INR', CURDATE(), TRUE, 'ACTIVE', 'CREDIT', 18, 10000.00, 10000000.00, 0.00, 10000000.00, 'DEPOSIT,CLOSURE', 'AVAILABLE,MATURITY', 'SYSTEM', 'DEFAULT', NOW(), NOW(), 'RULES_SYS', 1, NOW(), '+05:30', UUID()),

-- Product 5: Long Term FD (3-10 years)
('FD_LONG', 'Long Term Fixed Deposit', 'FD', 'INR', CURDATE(), TRUE, 'ACTIVE', 'CREDIT', 18, 25000.00, 10000000.00, 0.00, 10000000.00, 'DEPOSIT,CLOSURE', 'AVAILABLE,MATURITY', 'SYSTEM', 'DEFAULT', NOW(), NOW(), 'RULES_SYS', 1, NOW(), '+05:30', UUID()),

-- Product 6: Flexi FD with Partial Withdrawal
('FD_FLEXI', 'Flexible FD with Partial Withdrawal', 'FD', 'INR', CURDATE(), TRUE, 'ACTIVE', 'CREDIT', 18, 25000.00, 5000000.00, 10000.00, 500000.00, 'DEPOSIT,WITHDRAWAL,CLOSURE', 'AVAILABLE,MATURITY', 'SYSTEM', 'DEFAULT', NOW(), NOW(), 'RULES_SYS', 1, NOW(), '+05:30', UUID()),

-- Product 7: Cumulative Interest FD (Interest reinvested)
('FD_CUMULATIVE', 'Cumulative Interest FD', 'FD', 'INR', CURDATE(), TRUE, 'ACTIVE', 'CREDIT', 18, 10000.00, 10000000.00, 0.00, 10000000.00, 'DEPOSIT,CLOSURE', 'AVAILABLE,MATURITY', 'SYSTEM', 'DEFAULT', NOW(), NOW(), 'RULES_SYS', 1, NOW(), '+05:30', UUID()),

-- Product 8: Corporate FD (High value, higher rates)
('FD_CORP', 'Corporate Fixed Deposit', 'FD', 'INR', CURDATE(), TRUE, 'ACTIVE', 'CREDIT', 18, 100000.00, 100000000.00, 0.00, 100000000.00, 'DEPOSIT,CLOSURE', 'AVAILABLE,MATURITY', 'SYSTEM', 'DEFAULT', NOW(), NOW(), 'RULES_SYS', 1, NOW(), '+05:30', UUID()),

-- Product 9: NRI FD (For Non-Resident Indians)
('FD_NRI', 'NRE Fixed Deposit', 'FD', 'INR', CURDATE(), TRUE, 'ACTIVE', 'CREDIT', 18, 10000.00, 10000000.00, 0.00, 10000000.00, 'DEPOSIT,CLOSURE', 'AVAILABLE,MATURITY', 'SYSTEM', 'DEFAULT', NOW(), NOW(), 'RULES_SYS', 1, NOW(), '+05:30', UUID()),

-- Product 10: Student FD (Lower minimum, educational purpose)
('FD_STUDENT', 'Student Fixed Deposit', 'FD', 'INR', CURDATE(), TRUE, 'ACTIVE', 'CREDIT', 18, 1000.00, 500000.00, 0.00, 500000.00, 'DEPOSIT,CLOSURE', 'AVAILABLE,MATURITY', 'SYSTEM', 'DEFAULT', NOW(), NOW(), 'RULES_SYS', 1, NOW(), '+05:30', UUID()),

-- Product 11: Premium FD (High rates for high deposits)
('FD_PREMIUM', 'Premium High-Yield FD', 'FD', 'INR', CURDATE(), TRUE, 'ACTIVE', 'CREDIT', 18, 500000.00, 10000000.00, 0.00, 10000000.00, 'DEPOSIT,CLOSURE', 'AVAILABLE,MATURITY', 'SYSTEM', 'DEFAULT', NOW(), NOW(), 'RULES_SYS', 1, NOW(), '+05:30', UUID()),

-- Product 12: Monthly Income FD (Monthly interest payout)
('FD_MONTHLY', 'Monthly Income FD', 'FD', 'INR', CURDATE(), TRUE, 'ACTIVE', 'CREDIT', 18, 100000.00, 10000000.00, 0.00, 10000000.00, 'DEPOSIT,CLOSURE', 'AVAILABLE,MATURITY', 'SYSTEM', 'DEFAULT', NOW(), NOW(), 'RULES_SYS', 1, NOW(), '+05:30', UUID());

-- Insert Product Business Rules (Term and Rate Limits)
INSERT INTO product_business_rules (product_id, term_limit_min, term_limit_max, rate_limit_min, rate_limit_max, transaction_type) VALUES
-- Tax Saver: Fixed 5-year (60 months), 7.0-7.5%
((SELECT product_id FROM products WHERE product_code = 'FD_TAX_SAVER'), 60, 60, 7.00, 7.50, 'DEPOSIT'),

-- Senior Citizen: 1-10 years, 7.5-8.5% (higher rates)
((SELECT product_id FROM products WHERE product_code = 'FD_SENIOR'), 12, 120, 7.50, 8.50, 'DEPOSIT'),

-- Short Term: 3-12 months, 5.5-6.5%
((SELECT product_id FROM products WHERE product_code = 'FD_SHORT'), 3, 12, 5.50, 6.50, 'DEPOSIT'),

-- Medium Term: 12-36 months, 6.5-7.5%
((SELECT product_id FROM products WHERE product_code = 'FD_MEDIUM'), 6, 36, 6.50, 7.50, 'DEPOSIT'),

-- Long Term: 36-120 months, 7.0-8.0%
((SELECT product_id FROM products WHERE product_code = 'FD_LONG'), 24, 120, 7.00, 8.00, 'DEPOSIT'),

-- Flexi FD: 12-48 months, 6.5-7.5%
((SELECT product_id FROM products WHERE product_code = 'FD_FLEXI'), 12, 48, 6.50, 7.50, 'DEPOSIT'),

-- Cumulative: 24-120 months, 7.0-8.0%
((SELECT product_id FROM products WHERE product_code = 'FD_CUMULATIVE'), 24, 120, 7.00, 8.00, 'DEPOSIT'),

-- Corporate: 12-36 months, 7.5-8.5%
((SELECT product_id FROM products WHERE product_code = 'FD_CORP'), 12, 36, 7.50, 8.50, 'DEPOSIT'),

-- NRI: 12-60 months, 6.5-7.5%
((SELECT product_id FROM products WHERE product_code = 'FD_NRI'), 12, 60, 6.50, 7.50, 'DEPOSIT'),

-- Student: 6-24 months, 6.0-7.0%
((SELECT product_id FROM products WHERE product_code = 'FD_STUDENT'), 6, 24, 6.00, 7.00, 'DEPOSIT'),

-- Premium: 24-60 months, 7.5-8.5%
((SELECT product_id FROM products WHERE product_code = 'FD_PREMIUM'), 24, 60, 7.50, 8.50, 'DEPOSIT'),

-- Monthly Income: 12-60 months, 6.5-7.5%
((SELECT product_id FROM products WHERE product_code = 'FD_MONTHLY'), 12, 60, 6.50, 7.50, 'DEPOSIT');

-- Insert Product Charges
INSERT INTO product_charges (product_id, charge_type, charge_value, charge_unit, fee_type) VALUES
-- Tax Saver: No premature withdrawal allowed
((SELECT product_id FROM products WHERE product_code = 'FD_TAX_SAVER'), 'PREMATURE_WITHDRAWAL', 0.00, 'flat', 'EVENT_BASED'),

-- Senior Citizen: 1% penalty
((SELECT product_id FROM products WHERE product_code = 'FD_SENIOR'), 'PREMATURE_WITHDRAWAL', 1.00, 'percentage', 'EVENT_BASED'),

-- Short Term: 1% penalty
((SELECT product_id FROM products WHERE product_code = 'FD_SHORT'), 'PREMATURE_WITHDRAWAL', 1.00, 'percentage', 'EVENT_BASED'),

-- Medium Term: 1% penalty
((SELECT product_id FROM products WHERE product_code = 'FD_MEDIUM'), 'PREMATURE_WITHDRAWAL', 1.00, 'percentage', 'EVENT_BASED'),

-- Long Term: 1% penalty
((SELECT product_id FROM products WHERE product_code = 'FD_LONG'), 'PREMATURE_WITHDRAWAL', 1.00, 'percentage', 'EVENT_BASED'),

-- Flexi FD: 0.5% penalty (more flexible)
((SELECT product_id FROM products WHERE product_code = 'FD_FLEXI'), 'PREMATURE_WITHDRAWAL', 0.50, 'percentage', 'EVENT_BASED'),

-- Cumulative: 1% penalty
((SELECT product_id FROM products WHERE product_code = 'FD_CUMULATIVE'), 'PREMATURE_WITHDRAWAL', 1.00, 'percentage', 'EVENT_BASED'),

-- Corporate: 1% penalty
((SELECT product_id FROM products WHERE product_code = 'FD_CORP'), 'PREMATURE_WITHDRAWAL', 1.00, 'percentage', 'EVENT_BASED'),

-- NRI: 1% penalty
((SELECT product_id FROM products WHERE product_code = 'FD_NRI'), 'PREMATURE_WITHDRAWAL', 1.00, 'percentage', 'EVENT_BASED'),

-- Student: 0.5% penalty (student-friendly)
((SELECT product_id FROM products WHERE product_code = 'FD_STUDENT'), 'PREMATURE_WITHDRAWAL', 0.50, 'percentage', 'EVENT_BASED'),

-- Premium: 0.5% penalty (premium benefit)
((SELECT product_id FROM products WHERE product_code = 'FD_PREMIUM'), 'PREMATURE_WITHDRAWAL', 0.50, 'percentage', 'EVENT_BASED'),

-- Monthly Income: 1% penalty
((SELECT product_id FROM products WHERE product_code = 'FD_MONTHLY'), 'PREMATURE_WITHDRAWAL', 1.00, 'percentage', 'EVENT_BASED');

-- Insert Product Roles
INSERT INTO product_roles (product_id, role_type, is_mandatory) VALUES
-- Tax Saver
((SELECT product_id FROM products WHERE product_code = 'FD_TAX_SAVER'), 'OWNER', TRUE),
((SELECT product_id FROM products WHERE product_code = 'FD_TAX_SAVER'), 'NOMINEE', FALSE),

-- Senior Citizen
((SELECT product_id FROM products WHERE product_code = 'FD_SENIOR'), 'OWNER', TRUE),
((SELECT product_id FROM products WHERE product_code = 'FD_SENIOR'), 'NOMINEE', FALSE),

-- Short Term
((SELECT product_id FROM products WHERE product_code = 'FD_SHORT'), 'OWNER', TRUE),
((SELECT product_id FROM products WHERE product_code = 'FD_SHORT'), 'NOMINEE', FALSE),

-- Medium Term
((SELECT product_id FROM products WHERE product_code = 'FD_MEDIUM'), 'OWNER', TRUE),
((SELECT product_id FROM products WHERE product_code = 'FD_MEDIUM'), 'NOMINEE', FALSE),

-- Long Term
((SELECT product_id FROM products WHERE product_code = 'FD_LONG'), 'OWNER', TRUE),
((SELECT product_id FROM products WHERE product_code = 'FD_LONG'), 'NOMINEE', FALSE),

-- Flexi FD
((SELECT product_id FROM products WHERE product_code = 'FD_FLEXI'), 'OWNER', TRUE),
((SELECT product_id FROM products WHERE product_code = 'FD_FLEXI'), 'NOMINEE', FALSE),

-- Cumulative
((SELECT product_id FROM products WHERE product_code = 'FD_CUMULATIVE'), 'OWNER', TRUE),
((SELECT product_id FROM products WHERE product_code = 'FD_CUMULATIVE'), 'NOMINEE', FALSE),

-- Corporate
((SELECT product_id FROM products WHERE product_code = 'FD_CORP'), 'OWNER', TRUE),
((SELECT product_id FROM products WHERE product_code = 'FD_CORP'), 'NOMINEE', FALSE),

-- NRI
((SELECT product_id FROM products WHERE product_code = 'FD_NRI'), 'OWNER', TRUE),
((SELECT product_id FROM products WHERE product_code = 'FD_NRI'), 'NOMINEE', FALSE),

-- Student
((SELECT product_id FROM products WHERE product_code = 'FD_STUDENT'), 'OWNER', TRUE),
((SELECT product_id FROM products WHERE product_code = 'FD_STUDENT'), 'GUARDIAN', FALSE),

-- Premium
((SELECT product_id FROM products WHERE product_code = 'FD_PREMIUM'), 'OWNER', TRUE),
((SELECT product_id FROM products WHERE product_code = 'FD_PREMIUM'), 'NOMINEE', FALSE),

-- Monthly Income
((SELECT product_id FROM products WHERE product_code = 'FD_MONTHLY'), 'OWNER', TRUE),
((SELECT product_id FROM products WHERE product_code = 'FD_MONTHLY'), 'NOMINEE', FALSE);

-- Insert Product Rate Variations (Customer Category Bonuses)
INSERT INTO product_rate_variations (product_id, customer_category, rate_modifier) VALUES
-- Tax Saver: No variations (fixed for tax benefit)
((SELECT product_id FROM products WHERE product_code = 'FD_TAX_SAVER'), 'GENERAL', 0.00),

-- Senior Citizen: Extra 0.5% for seniors
((SELECT product_id FROM products WHERE product_code = 'FD_SENIOR'), 'GENERAL', 0.00),
((SELECT product_id FROM products WHERE product_code = 'FD_SENIOR'), 'SENIOR_CITIZEN', 0.50),
((SELECT product_id FROM products WHERE product_code = 'FD_SENIOR'), 'EMPLOYEE', 0.25),

-- Short Term
((SELECT product_id FROM products WHERE product_code = 'FD_SHORT'), 'GENERAL', 0.00),
((SELECT product_id FROM products WHERE product_code = 'FD_SHORT'), 'SENIOR_CITIZEN', 0.50),
((SELECT product_id FROM products WHERE product_code = 'FD_SHORT'), 'EMPLOYEE', 0.25),

-- Medium Term
((SELECT product_id FROM products WHERE product_code = 'FD_MEDIUM'), 'GENERAL', 0.00),
((SELECT product_id FROM products WHERE product_code = 'FD_MEDIUM'), 'SENIOR_CITIZEN', 0.50),
((SELECT product_id FROM products WHERE product_code = 'FD_MEDIUM'), 'EMPLOYEE', 0.25),

-- Long Term
((SELECT product_id FROM products WHERE product_code = 'FD_LONG'), 'GENERAL', 0.00),
((SELECT product_id FROM products WHERE product_code = 'FD_LONG'), 'SENIOR_CITIZEN', 0.50),
((SELECT product_id FROM products WHERE product_code = 'FD_LONG'), 'EMPLOYEE', 0.25),

-- Flexi FD
((SELECT product_id FROM products WHERE product_code = 'FD_FLEXI'), 'GENERAL', 0.00),
((SELECT product_id FROM products WHERE product_code = 'FD_FLEXI'), 'SENIOR_CITIZEN', 0.50),
((SELECT product_id FROM products WHERE product_code = 'FD_FLEXI'), 'EMPLOYEE', 0.25),

-- Cumulative
((SELECT product_id FROM products WHERE product_code = 'FD_CUMULATIVE'), 'GENERAL', 0.00),
((SELECT product_id FROM products WHERE product_code = 'FD_CUMULATIVE'), 'SENIOR_CITIZEN', 0.50),
((SELECT product_id FROM products WHERE product_code = 'FD_CUMULATIVE'), 'EMPLOYEE', 0.25),

-- Corporate
((SELECT product_id FROM products WHERE product_code = 'FD_CORP'), 'GENERAL', 0.00),
((SELECT product_id FROM products WHERE product_code = 'FD_CORP'), 'CORPORATE', 0.30),

-- NRI
((SELECT product_id FROM products WHERE product_code = 'FD_NRI'), 'GENERAL', 0.00),
((SELECT product_id FROM products WHERE product_code = 'FD_NRI'), 'NRI', 0.25),

-- Student
((SELECT product_id FROM products WHERE product_code = 'FD_STUDENT'), 'GENERAL', 0.00),
((SELECT product_id FROM products WHERE product_code = 'FD_STUDENT'), 'STUDENT', 0.25),

-- Premium
((SELECT product_id FROM products WHERE product_code = 'FD_PREMIUM'), 'GENERAL', 0.00),
((SELECT product_id FROM products WHERE product_code = 'FD_PREMIUM'), 'SENIOR_CITIZEN', 0.50),
((SELECT product_id FROM products WHERE product_code = 'FD_PREMIUM'), 'EMPLOYEE', 0.25),

-- Monthly Income
((SELECT product_id FROM products WHERE product_code = 'FD_MONTHLY'), 'GENERAL', 0.00),
((SELECT product_id FROM products WHERE product_code = 'FD_MONTHLY'), 'SENIOR_CITIZEN', 0.50),
((SELECT product_id FROM products WHERE product_code = 'FD_MONTHLY'), 'EMPLOYEE', 0.25);

-- Enable optional joint holders for all FD products, including existing catalogs.
INSERT INTO product_roles (product_id, role_type, is_mandatory)
SELECT p.product_id, 'CO-OWNER', FALSE
FROM products p
WHERE p.product_type = 'FD'
  AND NOT EXISTS (
    SELECT 1 FROM product_roles r
    WHERE r.product_id = p.product_id AND r.role_type = 'CO-OWNER'
  );
