-- =============================================================================
-- V12: Tier 2 high-frequency query indexes
-- Authority: DOMAIN_MODEL.md §7 (Index Strategy — Tier 2)
-- SYSTEM_ARCHITECTURE.md §7.2 (migration strategy)
-- =============================================================================

-- idx_milestones_project_status — composite for dashboard queries
-- DOMAIN_MODEL.md §7: "idx_milestones_project_status — composite (project_id, status)"
-- Already created in V4 — verified present
-- CREATE INDEX IF NOT EXISTS idx_milestones_project_status ON milestones (project_id, status);

-- GIN index on notification metadata JSONB for future AI/filter queries
-- DOMAIN_MODEL.md §7: "GIN index on JSONB metadata columns when AI/filter features are added"
CREATE INDEX IF NOT EXISTS idx_notifications_metadata_gin
    ON notifications USING GIN (metadata)
    WHERE metadata IS NOT NULL;

-- GIN index on activity_events metadata JSONB
CREATE INDEX IF NOT EXISTS idx_activity_metadata_gin
    ON activity_events USING GIN (metadata)
    WHERE metadata IS NOT NULL;

-- GIN index on outbox_events payload JSONB for type-based queries
CREATE INDEX IF NOT EXISTS idx_outbox_payload_gin
    ON outbox_events USING GIN (payload);

-- Partial index on milestones for funded/in-progress states
-- Supports escrow status widget queries
CREATE INDEX IF NOT EXISTS idx_milestones_active_states
    ON milestones (project_id, updated_at DESC)
    WHERE status IN ('FUNDED', 'IN_PROGRESS', 'SUBMITTED');
