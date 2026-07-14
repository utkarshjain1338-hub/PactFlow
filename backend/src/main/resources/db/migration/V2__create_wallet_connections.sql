-- =============================================================================
-- V2: Create wallet_connections table
-- Authority: DOMAIN_MODEL.md §6 (wallet_connections specifications)
-- SYSTEM_ARCHITECTURE.md §8.5 (Wallet Authentication Detail)
-- =============================================================================

CREATE TABLE IF NOT EXISTS wallet_connections (
    id                  UUID            NOT NULL,
    user_id             UUID            NOT NULL,
    stellar_public_key  VARCHAR(56)     NOT NULL,
    wallet_provider     VARCHAR(50)     NOT NULL,
    is_primary          BOOLEAN         NOT NULL DEFAULT FALSE,
    verified_at         TIMESTAMPTZ,
    is_deleted          BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_wallet_connections PRIMARY KEY (id),
    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT uq_wallet_public_key UNIQUE (stellar_public_key),
    CONSTRAINT chk_wallet_provider CHECK (
        wallet_provider IN ('FREIGHTER', 'XBULL', 'RABET', 'LOBSTR', 'OTHER')
    )
);

-- Only one primary wallet per user (partial unique index)
-- DOMAIN_MODEL.md §6: "Partial unique index (user_id) WHERE is_primary=true AND is_deleted=false"
CREATE UNIQUE INDEX uq_wallet_primary_per_user
    ON wallet_connections (user_id)
    WHERE is_primary = TRUE AND is_deleted = FALSE;

-- Standard indexes
CREATE INDEX idx_wallet_user_id ON wallet_connections (user_id);
