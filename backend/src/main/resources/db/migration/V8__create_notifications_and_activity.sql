-- =============================================================================
-- V8: Create notifications and activity_events tables
-- Authority: DOMAIN_MODEL.md §6 (notifications, activity_events specifications)
-- SYSTEM_ARCHITECTURE.md §11.2 (Domain Event Catalog)
-- =============================================================================

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id                  UUID            NOT NULL,
    recipient_id        UUID            NOT NULL,
    notification_type   VARCHAR(50)     NOT NULL,
    delivery_channel    VARCHAR(20)     NOT NULL DEFAULT 'IN_APP',
    title               VARCHAR(200)    NOT NULL,
    body                TEXT            NOT NULL,
    action_url          VARCHAR(2048),
    metadata            JSONB,
    is_read             BOOLEAN         NOT NULL DEFAULT FALSE,
    read_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_notifications PRIMARY KEY (id),
    CONSTRAINT fk_notification_recipient FOREIGN KEY (recipient_id)
        REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_notification_channel CHECK (
        delivery_channel IN ('IN_APP', 'EMAIL', 'BOTH')
    )
);

-- Partial index for unread notifications (badge count queries)
-- DOMAIN_MODEL.md §7: "idx_notifications_recipient_unread — partial WHERE is_read=false"
CREATE INDEX idx_notifications_recipient_unread
    ON notifications (recipient_id, created_at DESC)
    WHERE is_read = FALSE;

CREATE INDEX idx_notifications_recipient_id ON notifications (recipient_id);
CREATE INDEX idx_notifications_created_at ON notifications (created_at DESC);

-- ─── ACTIVITY EVENTS ─────────────────────────────────────────────────────────
-- Immutable audit log — never update or delete
-- DOMAIN_MODEL.md §6: "Immutable log. Never update or delete."
CREATE TABLE IF NOT EXISTS activity_events (
    id              UUID            NOT NULL,
    actor_id        UUID            NOT NULL,
    event_type      VARCHAR(60)     NOT NULL,
    project_id      UUID,
    milestone_id    UUID,
    summary         VARCHAR(500)    NOT NULL,
    metadata        JSONB,
    occurred_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_activity_events PRIMARY KEY (id),
    CONSTRAINT fk_activity_actor FOREIGN KEY (actor_id)
        REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_activity_project FOREIGN KEY (project_id)
        REFERENCES projects(id) ON DELETE RESTRICT,
    CONSTRAINT fk_activity_milestone FOREIGN KEY (milestone_id)
        REFERENCES milestones(id) ON DELETE RESTRICT
);

CREATE INDEX idx_activity_actor_id ON activity_events (actor_id);
CREATE INDEX idx_activity_project_id ON activity_events (project_id);
CREATE INDEX idx_activity_milestone_id ON activity_events (milestone_id);
CREATE INDEX idx_activity_event_type ON activity_events (event_type);
-- BRIN for timeline queries
CREATE INDEX idx_activity_occurred_at ON activity_events
    USING BRIN (occurred_at) WITH (pages_per_range = 64);
