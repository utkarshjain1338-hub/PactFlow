-- =============================================================================
-- V1: Create users and user_sessions tables
-- Authority: DOMAIN_MODEL.md §6 (users, user_sessions table specifications)
-- =============================================================================

-- ─── USERS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              UUID            NOT NULL,
    email           VARCHAR(320)    NOT NULL,
    password_hash   TEXT,
    account_type    VARCHAR(20)     NOT NULL,
    display_name    VARCHAR(100)    NOT NULL,
    avatar_url      VARCHAR(2048),
    timezone        VARCHAR(50)     NOT NULL DEFAULT 'UTC',
    bio             TEXT,
    is_email_verified BOOLEAN       NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    is_deleted      BOOLEAN         NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    version         BIGINT          NOT NULL DEFAULT 1,

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT chk_users_account_type CHECK (account_type IN ('COMPANY', 'FREELANCER', 'ADMIN')),
    CONSTRAINT chk_users_bio_length CHECK (bio IS NULL OR char_length(bio) <= 1000),
    CONSTRAINT chk_users_timezone_not_blank CHECK (char_length(trim(timezone)) > 0)
);

-- Unique email index — partial (excludes soft-deleted users)
-- DOMAIN_MODEL.md §6: "Unique partial WHERE is_deleted=false"
CREATE UNIQUE INDEX idx_users_email
    ON users (lower(email))
    WHERE is_deleted = FALSE;

-- Secondary indexes per DOMAIN_MODEL.md §6
CREATE INDEX idx_users_account_type ON users (account_type);
CREATE INDEX idx_users_created_at ON users (created_at DESC);
CREATE INDEX idx_users_is_active ON users (is_active) WHERE is_active = TRUE;

-- ─── USER SESSIONS ───────────────────────────────────────────────────────────
-- SYSTEM_ARCHITECTURE.md §8.2: JWT refresh token hash storage
CREATE TABLE IF NOT EXISTS user_sessions (
    id                  UUID            NOT NULL,
    user_id             UUID            NOT NULL,
    token_hash          VARCHAR(128)    NOT NULL,
    refresh_token_hash  VARCHAR(128),
    ip_address          INET,
    user_agent          VARCHAR(512),
    expires_at          TIMESTAMPTZ     NOT NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_user_sessions PRIMARY KEY (id),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_sessions_token_hash UNIQUE (token_hash),
    CONSTRAINT uq_sessions_refresh_token UNIQUE (refresh_token_hash)
);

-- Indexes per DOMAIN_MODEL.md §6
CREATE INDEX idx_sessions_user_id ON user_sessions (user_id);
CREATE INDEX idx_sessions_expires_at ON user_sessions (expires_at);
