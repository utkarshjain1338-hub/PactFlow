-- =============================================================================
-- V20: Add allowed_roles to users
-- Modifies the users table to allow a single user to hold multiple roles
-- (e.g., both COMPANY and FREELANCER), paving the way for secure account switching.
-- =============================================================================

ALTER TABLE users 
ADD COLUMN allowed_roles VARCHAR(100);

-- Populate the new column with the user's existing primary account type
UPDATE users 
SET allowed_roles = account_type;

-- Enforce NOT NULL now that it is populated
ALTER TABLE users 
ALTER COLUMN allowed_roles SET NOT NULL;
