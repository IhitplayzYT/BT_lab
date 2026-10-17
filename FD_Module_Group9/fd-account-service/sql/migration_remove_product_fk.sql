USE banking_technology_lab;
SET @drop_product_fk = IF(EXISTS(
  SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'fd_accounts'
    AND CONSTRAINT_NAME = 'fk_fd_accounts_product' AND CONSTRAINT_TYPE = 'FOREIGN KEY'
), 'ALTER TABLE fd_accounts DROP FOREIGN KEY fk_fd_accounts_product', 'SELECT 1');
PREPARE product_fk_migration FROM @drop_product_fk;
EXECUTE product_fk_migration;
DEALLOCATE PREPARE product_fk_migration;
