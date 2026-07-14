-- =============================================================================
-- PostgreSQL Initialization Script
-- Authority: SYSTEM_ARCHITECTURE.md §7.5 (Row-Level Security Policies)
-- DOMAIN_MODEL.md §9 (Security at Schema Level)
--
-- Creates the three application database roles:
--   pactflow_app       — main API (read/write, excl. direct escrow writes)
--   pactflow_ingestion — daemon (escrow_contracts + blockchain_transactions only)
--   pactflow_readonly  — SELECT only (analytics, reporting)
--
-- NOTE: In the MVP single-DB setup, all roles connect with the same credentials.
-- Full role separation is implemented in production via DB provisioning scripts.
-- =============================================================================

-- Create roles if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'pactflow_ingestion') THEN
        CREATE ROLE pactflow_ingestion;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'pactflow_readonly') THEN
        CREATE ROLE pactflow_readonly;
    END IF;
END
$$;

-- Grant connection to the development database
GRANT CONNECT ON DATABASE pactflow_dev TO pactflow_app;

-- pactflow_readonly — SELECT on all tables
GRANT USAGE ON SCHEMA public TO pactflow_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO pactflow_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO pactflow_readonly;
