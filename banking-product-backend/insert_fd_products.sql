-- Insert missing FD Products from DataInitializer
-- These products were skipped during initialization because other products already existed
-- Only insert products that don't already exist (Products 8, 9, 10)

-- Product 8: Corporate FD
INSERT INTO products (product_code, product_name, product_type, currency, effective_date, is_active, status, interest_type, min_age, min_deposit, max_deposit, allowed_transaction_types, balance_types, tax_rate, service_fee_rate, service_fee_flat, documentation_fee, gst_rate, premature_penalty_rate, ldbid, ooo_acpt_ts_utc_ofst, ooo_user_id, ooo_ws_id, rule_system_id, uuid, ooo_acpt_ts, ooo_host_ts, ooo_local_ts)
VALUES ('FD_CORP', 'Corporate Fixed Deposit', 'FD', 'INR', CURDATE(), TRUE, 'ACTIVE', 'CREDIT', NULL, 100000.00, 100000000.00, 'DEPOSIT,WITHDRAWAL', 'PRINCIPAL,INTEREST', NULL, NULL, NULL, NULL, 18.00, 1.00, 1, '+05:30', 'SYSTEM', 'DEFAULT', 'RULES_SYS', UUID(), NOW(6), NOW(6), NOW(6));

SET @product_id_8 = LAST_INSERT_ID();

INSERT INTO product_business_rules (product_id, term_limit_min, term_limit_max, rate_limit_min, rate_limit_max, transaction_type)
VALUES (@product_id_8, 12, 36, 7.50, 8.50, 'DEPOSIT');

INSERT INTO product_charges (product_id, charge_type, charge_value, charge_unit, fee_type)
VALUES (@product_id_8, 'PREMATURE_WITHDRAWAL', 1.00, 'percentage', 'EVENT_BASED');

INSERT INTO product_roles (product_id, role_type, is_mandatory)
VALUES (@product_id_8, 'OWNER', TRUE), (@product_id_8, 'NOMINEE', FALSE);

INSERT INTO product_rate_variations (product_id, customer_category, rate_modifier)
VALUES (@product_id_8, 'GENERAL', 0.00), (@product_id_8, 'SENIOR_CITIZEN', 0.50), (@product_id_8, 'EMPLOYEE', 0.25);

-- Product 9: Flexi FD
INSERT INTO products (product_code, product_name, product_type, currency, effective_date, is_active, status, interest_type, min_age, min_deposit, max_deposit, allowed_transaction_types, balance_types, tax_rate, service_fee_rate, service_fee_flat, documentation_fee, gst_rate, premature_penalty_rate, ldbid, ooo_acpt_ts_utc_ofst, ooo_user_id, ooo_ws_id, rule_system_id, uuid, ooo_acpt_ts, ooo_host_ts, ooo_local_ts)
VALUES ('FD_FLEXI', 'Flexible FD with Partial Withdrawal', 'FD', 'INR', CURDATE(), TRUE, 'ACTIVE', 'CREDIT', NULL, 25000.00, 5000000.00, 'DEPOSIT,WITHDRAWAL', 'PRINCIPAL,INTEREST', NULL, NULL, NULL, NULL, 18.00, 1.00, 1, '+05:30', 'SYSTEM', 'DEFAULT', 'RULES_SYS', UUID(), NOW(6), NOW(6), NOW(6));

SET @product_id_9 = LAST_INSERT_ID();

INSERT INTO product_business_rules (product_id, term_limit_min, term_limit_max, rate_limit_min, rate_limit_max, transaction_type)
VALUES (@product_id_9, 12, 48, 6.50, 7.50, 'DEPOSIT');

INSERT INTO product_charges (product_id, charge_type, charge_value, charge_unit, fee_type)
VALUES (@product_id_9, 'PREMATURE_WITHDRAWAL', 1.00, 'percentage', 'EVENT_BASED');

INSERT INTO product_roles (product_id, role_type, is_mandatory)
VALUES (@product_id_9, 'OWNER', TRUE), (@product_id_9, 'NOMINEE', FALSE);

INSERT INTO product_rate_variations (product_id, customer_category, rate_modifier)
VALUES (@product_id_9, 'GENERAL', 0.00), (@product_id_9, 'SENIOR_CITIZEN', 0.50), (@product_id_9, 'EMPLOYEE', 0.25);

-- Product 10: Cumulative FD
INSERT INTO products (product_code, product_name, product_type, currency, effective_date, is_active, status, interest_type, min_age, min_deposit, max_deposit, allowed_transaction_types, balance_types, tax_rate, service_fee_rate, service_fee_flat, documentation_fee, gst_rate, premature_penalty_rate, ldbid, ooo_acpt_ts_utc_ofst, ooo_user_id, ooo_ws_id, rule_system_id, uuid, ooo_acpt_ts, ooo_host_ts, ooo_local_ts)
VALUES ('FD_CUMULATIVE', 'Cumulative Interest FD', 'FD', 'INR', CURDATE(), TRUE, 'ACTIVE', 'CREDIT', NULL, 10000.00, 10000000.00, 'DEPOSIT,WITHDRAWAL', 'PRINCIPAL,INTEREST', NULL, NULL, NULL, NULL, 18.00, 1.00, 1, '+05:30', 'SYSTEM', 'DEFAULT', 'RULES_SYS', UUID(), NOW(6), NOW(6), NOW(6));

SET @product_id_10 = LAST_INSERT_ID();

INSERT INTO product_business_rules (product_id, term_limit_min, term_limit_max, rate_limit_min, rate_limit_max, transaction_type)
VALUES (@product_id_10, 24, 120, 7.00, 8.00, 'DEPOSIT');

INSERT INTO product_charges (product_id, charge_type, charge_value, charge_unit, fee_type)
VALUES (@product_id_10, 'PREMATURE_WITHDRAWAL', 1.00, 'percentage', 'EVENT_BASED');

INSERT INTO product_roles (product_id, role_type, is_mandatory)
VALUES (@product_id_10, 'OWNER', TRUE), (@product_id_10, 'NOMINEE', FALSE);

INSERT INTO product_rate_variations (product_id, customer_category, rate_modifier)
VALUES (@product_id_10, 'GENERAL', 0.00), (@product_id_10, 'SENIOR_CITIZEN', 0.50), (@product_id_10, 'EMPLOYEE', 0.25);
