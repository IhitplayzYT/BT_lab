#!/bin/bash

# Restore script for FD Module Group9 data
# Usage: ./restore-fd-data.sh <backup_file>

if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file>"
  echo "Example: $0 ./backups/fd-data/fd_backup_20261018_124600.sql"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "Restoring FD Module Group9 data from: $BACKUP_FILE"

# Restore to fd-group9-mysql
docker exec -i fd-group9-mysql mysql -u root -p12345 banking_technology_lab < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Restore completed successfully!"
else
  echo "Restore failed!"
  exit 1
fi
