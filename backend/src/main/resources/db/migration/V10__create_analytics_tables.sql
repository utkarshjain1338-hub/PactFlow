-- =============================================================================
-- V10: Create analytics read model tables
-- Authority: DOMAIN_MODEL.md §6 (user_metric_snapshots, platform_daily_snapshots)
-- DOMAIN_MODEL.md §1 (Analytics bounded context — read models)
-- =============================================================================

-- ─── USER METRIC SNAPSHOTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_metric_snapshots (
    id                      UUID            NOT NULL,
    user_id                 UUID            NOT NULL,
    snapshot_date           DATE            NOT NULL,
    milestones_completed    INTEGER         NOT NULL DEFAULT 0,
    milestones_funded       INTEGER         NOT NULL DEFAULT 0,
    total_earned_xlm        NUMERIC(20,7)   NOT NULL DEFAULT 0,
    total_paid_xlm          NUMERIC(20,7)   NOT NULL DEFAULT 0,
    avg_completion_days     NUMERIC(6,2),
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_user_metrics PRIMARY KEY (id),
    CONSTRAINT fk_user_metric_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE RESTRICT,
    -- One row per user per day
    CONSTRAINT uq_user_metric_snapshot UNIQUE (user_id, snapshot_date),
    CONSTRAINT chk_user_metrics_earned CHECK (total_earned_xlm >= 0),
    CONSTRAINT chk_user_metrics_paid CHECK (total_paid_xlm >= 0),
    CONSTRAINT chk_user_metrics_completed CHECK (milestones_completed >= 0),
    CONSTRAINT chk_user_metrics_funded CHECK (milestones_funded >= 0)
);

CREATE INDEX idx_user_metrics_user_date ON user_metric_snapshots (user_id, snapshot_date DESC);

-- ─── PLATFORM DAILY SNAPSHOTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS platform_daily_snapshots (
    id                      UUID            NOT NULL,
    snapshot_date           DATE            NOT NULL,
    active_users            INTEGER         NOT NULL DEFAULT 0,
    new_registrations       INTEGER         NOT NULL DEFAULT 0,
    projects_created        INTEGER         NOT NULL DEFAULT 0,
    milestones_completed    INTEGER         NOT NULL DEFAULT 0,
    total_volume_xlm        NUMERIC(20,7)   NOT NULL DEFAULT 0,
    -- Level 5+: platform fee tracking (PROJECT_CONSTITUTION.md §14)
    total_fees_xlm          NUMERIC(20,7)   NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_platform_snapshots PRIMARY KEY (id),
    CONSTRAINT uq_platform_snapshot_date UNIQUE (snapshot_date),
    CONSTRAINT chk_platform_active_users CHECK (active_users >= 0),
    CONSTRAINT chk_platform_volume CHECK (total_volume_xlm >= 0),
    CONSTRAINT chk_platform_fees CHECK (total_fees_xlm >= 0)
);

-- ─── INGESTION DAEMON STATE ──────────────────────────────────────────────────
-- SYSTEM_ARCHITECTURE.md §6.5 (Event Cursor Strategy)
-- Tracks the last processed Soroban ledger for crash-safe resumption
CREATE TABLE IF NOT EXISTS daemon_state (
    id                          VARCHAR(50)     NOT NULL,
    last_processed_ledger       BIGINT          NOT NULL DEFAULT 0,
    last_poll_at                TIMESTAMPTZ,
    updated_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_daemon_state PRIMARY KEY (id)
);

-- Seed the ingestion daemon cursor record
INSERT INTO daemon_state (id, last_processed_ledger)
VALUES ('soroban_ingestion', 0)
ON CONFLICT (id) DO NOTHING;
