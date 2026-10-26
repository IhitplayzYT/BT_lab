#!/bin/bash

# Backup script for FD Module Group9 data
# Run this before docker compose down -v to preserve custom data

BACKUP_DIR="./backups/fd-data"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/fd_backup_$TIMESTAMP.sql"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "Backing up FD Module Group9 data..."

# Backup fd-group9-mysql
docker exec fd-group9-mysql mysqldump -u root -p12345 banking_technology_lab \
  --tables fd_accounts bundle_applications bundle_items customer_profile users \
  > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Backup saved to: $BACKUP_FILE"
  echo "To restore: docker exec -i fd-group9-mysql mysql -u root -p12345 banking_technology_lab < $BACKUP_FILE"
else
  echo "Backup failed!"
  exit 1
fi
