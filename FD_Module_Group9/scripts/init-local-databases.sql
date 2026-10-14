-- Run in MySQL Workbench as your database administrator.
-- These are independent service schemas. No existing tables are dropped.
CREATE DATABASE IF NOT EXISTS fd_batch;
CREATE DATABASE IF NOT EXISTS fd_statements;
CREATE DATABASE IF NOT EXISTS fd_notifications;
-- Run fd-account-service/sql/l12_l13_setup.sql then l16_fd_transactions.sql
-- then l14_l17_interest.sql for a new FD schema.
-- Batch and statement services create their own tables when started.
-- For an existing team database, review schema compatibility first.
