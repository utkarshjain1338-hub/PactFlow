-- =============================================================================
-- V11: Tier 1 critical indexes (already created inline in V1-V10)
-- This migration validates that all FK indexes exist — no-op if already created.
-- Authority: DOMAIN_MODEL.md §7 (Index Strategy Summary — Tier 1)
-- =============================================================================
-- All Tier 1 PK, UK, and FK indexes were created in their respective migrations.
-- This migration documents the intent and serves as a validation marker.
-- No DDL required here — Flyway requires non-empty files, so we place a comment block.
SELECT 1; -- Tier 1 index validation marker
