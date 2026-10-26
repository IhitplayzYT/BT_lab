USE banking_product_db;

-- Product charges are optional and must come from each product's configuration.
-- Preserve existing configured values while removing implicit defaults for new rows.
ALTER TABLE products ALTER COLUMN gst_rate DROP DEFAULT;
ALTER TABLE products ALTER COLUMN premature_penalty_rate DROP DEFAULT;
