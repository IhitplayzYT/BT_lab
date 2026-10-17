USE banking_product_db;
-- Preserve any legacy ID values but stop requiring an unused column for new inserts.
SET @legacy_id_sql = IF(EXISTS(SELECT 1 FROM information_schema.COLUMNS
 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'id'),
 'ALTER TABLE products MODIFY COLUMN id VARCHAR(50) NULL', 'SELECT 1');
PREPARE legacy_id_migration FROM @legacy_id_sql;
EXECUTE legacy_id_migration;
DEALLOCATE PREPARE legacy_id_migration;
