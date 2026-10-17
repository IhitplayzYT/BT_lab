-- Migration to add additional customer details to fd_accounts table
-- Run this to add new fields for comprehensive customer information

USE banking_technology_lab;

-- Add new columns to fd_accounts table
ALTER TABLE fd_accounts
ADD COLUMN applicant_first_name VARCHAR(100) NULL AFTER applicant_full_name,
ADD COLUMN applicant_middle_name VARCHAR(100) NULL AFTER applicant_first_name,
ADD COLUMN applicant_last_name VARCHAR(100) NULL AFTER applicant_middle_name,
ADD COLUMN applicant_age INT NULL AFTER applicant_last_name,
ADD COLUMN applicant_gender VARCHAR(20) NULL AFTER applicant_age,
ADD COLUMN applicant_occupation VARCHAR(100) NULL AFTER applicant_gender,
ADD COLUMN applicant_annual_income DECIMAL(15,2) NULL AFTER applicant_occupation,
ADD COLUMN applicant_address TEXT NULL AFTER applicant_annual_income,
ADD COLUMN applicant_city VARCHAR(100) NULL AFTER applicant_address,
ADD COLUMN applicant_state VARCHAR(100) NULL AFTER applicant_city,
ADD COLUMN applicant_pincode VARCHAR(10) NULL AFTER applicant_state,
ADD COLUMN applicant_nationality VARCHAR(50) NULL AFTER applicant_pincode,
ADD COLUMN applicant_marital_status VARCHAR(20) NULL AFTER applicant_nationality;

-- Update existing records to populate new fields from existing applicant_full_name
UPDATE fd_accounts
SET applicant_first_name = SUBSTRING_INDEX(applicant_full_name, ' ', 1),
    applicant_last_name = SUBSTRING_INDEX(applicant_full_name, ' ', -1)
WHERE applicant_full_name IS NOT NULL
  AND applicant_first_name IS NULL;
