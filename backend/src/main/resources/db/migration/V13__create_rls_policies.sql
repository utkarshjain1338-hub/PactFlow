-- =============================================================================
-- V13: Row-Level Security (RLS) policies
-- Authority: SYSTEM_ARCHITECTURE.md §7.5 (Row-Level Security Policies)
-- DOMAIN_MODEL.md §9 (Security at Schema Level)
-- SECURITY_THREAT_MODEL.md §10 (Database Threats)
--
-- Three PostgreSQL roles enforce least-privilege access:
--   pactflow_app       — main API (read/write excl. escrow writes)
--   pactflow_ingestion — daemon only (escrow_contracts, blockchain_transactions writes)
--   pactflow_readonly  — SELECT only (analytics, reporting)
-- =============================================================================

-- Enable RLS on escrow-critical tables
ALTER TABLE escrow_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_transactions ENABLE ROW LEVEL SECURITY;

-- ─── escrow_contracts policies ───────────────────────────────────────────────

-- The main API role may only SELECT from escrow_contracts
-- Writes come exclusively from pactflow_ingestion
CREATE POLICY escrow_app_select ON escrow_contracts
    FOR SELECT
    TO PUBLIC
    USING (TRUE);

-- ─── blockchain_transactions policies ────────────────────────────────────────

-- blockchain_transactions is an immutable ledger — no updates or deletes ever
-- DOMAIN_MODEL.md §8: "IMMUTABLE: No UPDATE or DELETE ever."
CREATE POLICY blockchain_tx_select ON blockchain_transactions
    FOR SELECT
    TO PUBLIC
    USING (TRUE);

-- Note: The INSERT-only policy for pactflow_ingestion role is enforced at the
-- application layer via Spring Security role checks (ROLE_DAEMON) since we
-- run a single DB user in the MVP. PostgreSQL role separation is documented
-- here as the architecture target. Full RLS role separation is implemented
-- in the production database provisioning scripts (infrastructure/terraform/).
--
-- TODO (Level 5): When Railway supports multiple DB users, add:
--   CREATE POLICY escrow_ingestion_insert ON escrow_contracts FOR INSERT TO pactflow_ingestion WITH CHECK (TRUE);
--   CREATE POLICY escrow_ingestion_update ON escrow_contracts FOR UPDATE TO pactflow_ingestion USING (TRUE);
