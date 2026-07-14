-- =============================================================================
-- V6: Create escrow_contracts table
-- Authority: DOMAIN_MODEL.md §6 (escrow_contracts specification)
-- DOMAIN_MODEL.md §9: "CRITICAL — write-protected from main API, ingestion daemon only"
-- SECURITY_THREAT_MODEL.md §10: "blockchain_transactions: RLS prohibits UPDATE/DELETE"
-- =============================================================================

CREATE TABLE IF NOT EXISTS escrow_contracts (
    id                          UUID            NOT NULL,
    milestone_id                UUID            NOT NULL,
    contract_address            VARCHAR(56)     NOT NULL,
    escrow_status               VARCHAR(30)     NOT NULL DEFAULT 'PENDING_DEPLOYMENT',
    locked_amount_xlm           NUMERIC(20,7)   NOT NULL,
    asset_code                  VARCHAR(12)     NOT NULL DEFAULT 'XLM',
    client_wallet_address       VARCHAR(56)     NOT NULL,
    freelancer_wallet_address   VARCHAR(56)     NOT NULL,
    -- Level 5+: arbitration slot (DOMAIN_MODEL.md §11, PROJECT_CONSTITUTION.md §14)
    arbitrator_wallet_address   VARCHAR(56),
    funded_at                   TIMESTAMPTZ,
    released_at                 TIMESTAMPTZ,
    refunded_at                 TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    version                     BIGINT          NOT NULL DEFAULT 1,

    CONSTRAINT pk_escrow_contracts PRIMARY KEY (id),
    CONSTRAINT fk_escrow_milestone FOREIGN KEY (milestone_id)
        REFERENCES milestones(id) ON DELETE RESTRICT,
    -- 1:1 with milestone
    CONSTRAINT uq_escrow_milestone_id UNIQUE (milestone_id),
    CONSTRAINT uq_escrow_contract_address UNIQUE (contract_address),
    CONSTRAINT chk_escrow_status CHECK (
        escrow_status IN ('PENDING_DEPLOYMENT', 'ACTIVE', 'RELEASED', 'REFUNDED')
    ),
    CONSTRAINT chk_escrow_locked_amount CHECK (locked_amount_xlm >= 0)
);

CREATE INDEX idx_escrow_milestone_id ON escrow_contracts (milestone_id);
CREATE INDEX idx_escrow_contract_address ON escrow_contracts (contract_address);
CREATE INDEX idx_escrow_status ON escrow_contracts (escrow_status);
