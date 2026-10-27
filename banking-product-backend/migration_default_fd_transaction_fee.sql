USE banking_product_db;

-- Apply the standard one-time application fee to every existing FD product.
-- Preserve any product that already has an equivalent custom processing fee.
INSERT INTO product_charges (product_id, charge_type, charge_value, charge_unit, fee_type)
SELECT p.product_id, 'PROCESSING_FEE', 100.00, 'flat', 'ONE_TIME'
FROM products p
WHERE UPPER(TRIM(p.product_type)) = 'FD'
  AND NOT EXISTS (
      SELECT 1
      FROM product_charges pc
      WHERE pc.product_id = p.product_id
        AND UPPER(REPLACE(TRIM(pc.charge_type), ' ', '_')) IN (
            'PROCESSING_FEE', 'TRANSACTION_FEE', 'DEPOSIT_FEE',
            'ACCOUNT_OPENING_FEE', 'APPLICATION_FEE'
        )
  );
