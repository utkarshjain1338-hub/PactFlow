-- =============================================================================
-- V9: Create outbox_events table (Transactional Outbox Pattern)
-- Authority: SYSTEM_ARCHITECTURE.md §11.3 (Transactional Outbox Pattern)
-- DOMAIN_MODEL.md §6 (outbox_events specification)
-- =============================================================================

CREATE TABLE IF NOT EXISTS outbox_events (
    id              UUID            NOT NULL,
    aggregate_type  VARCHAR(50)     NOT NULL,
    aggregate_id    UUID            NOT NULL,
    event_type      VARCHAR(80)     NOT NULL,
    payload         JSONB           NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    retry_count     INTEGER         NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    processed_at    TIMESTAMPTZ,

    CONSTRAINT pk_outbox_events PRIMARY KEY (id),
    CONSTRAINT chk_outbox_status CHECK (
        status IN ('PENDING', 'PROCESSED', 'FAILED')
    ),
    CONSTRAINT chk_outbox_retry_count CHECK (retry_count <= 5)
);

-- Partial index for pending events — critical for outbox processor query performance
-- SYSTEM_ARCHITECTURE.md §11.3: "SELECT * FROM outbox_events WHERE status='PENDING' LIMIT 50"
CREATE INDEX idx_outbox_status_pending
    ON outbox_events (created_at ASC)
    WHERE status = 'PENDING';

CREATE INDEX idx_outbox_created_at ON outbox_events (created_at ASC);
