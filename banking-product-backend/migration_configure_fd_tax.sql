-- Configure estimated tax deductions for the seeded FD catalog.
-- The Senior Citizen and Tax Saver products use the lower 5% rate requested.
UPDATE products
SET tax_rate = CASE
    WHEN product_code IN ('FD_SENIOR', 'FD_TAX_SAVER') THEN 5.00
    ELSE 10.00
END
WHERE product_code IN (
    'FD_SHORT', 'FD_MEDIUM', 'FD_LONG', 'FD_SENIOR', 'FD_TAX_SAVER',
    'FD_CORP', 'FD_FLEXI', 'FD_CUMULATIVE', 'FD_NRI', 'FD_STUDENT',
    'FD_PREMIUM', 'FD_MONTHLY'
);

-- Keep the rate available in chargeDetails for clients that read charge rows.
UPDATE product_charges pc
JOIN products p ON p.product_id = pc.product_id
SET pc.charge_value = p.tax_rate,
    pc.charge_unit = 'percentage',
    pc.fee_type = 'PERIODIC'
WHERE pc.charge_type = 'TAX'
  AND p.product_code IN (
      'FD_SHORT', 'FD_MEDIUM', 'FD_LONG', 'FD_SENIOR', 'FD_TAX_SAVER',
      'FD_CORP', 'FD_FLEXI', 'FD_CUMULATIVE', 'FD_NRI', 'FD_STUDENT',
      'FD_PREMIUM', 'FD_MONTHLY'
  );

INSERT INTO product_charges (product_id, charge_type, charge_value, charge_unit, fee_type)
SELECT p.product_id, 'TAX', p.tax_rate, 'percentage', 'PERIODIC'
FROM products p
WHERE p.product_code IN (
    'FD_SHORT', 'FD_MEDIUM', 'FD_LONG', 'FD_SENIOR', 'FD_TAX_SAVER',
    'FD_CORP', 'FD_FLEXI', 'FD_CUMULATIVE', 'FD_NRI', 'FD_STUDENT',
    'FD_PREMIUM', 'FD_MONTHLY'
)
  AND NOT EXISTS (
      SELECT 1 FROM product_charges pc
      WHERE pc.product_id = p.product_id AND UPPER(pc.charge_type) = 'TAX'
  );
