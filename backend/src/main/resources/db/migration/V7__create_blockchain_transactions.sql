-- =============================================================================
-- V7: Create blockchain_transactions table
-- Authority: DOMAIN_MODEL.md §6 (blockchain_transactions specification)
-- DOMAIN_MODEL.md §8: "IMMUTABLE: No UPDATE or DELETE ever"
-- SECURITY_THREAT_MODEL.md §10 (Database Threats — blockchain_transactions RLS)
-- =============================================================================

CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id                      UUID            NOT NULL,
    escrow_contract_id      UUID            NOT NULL,
    -- Denormalized for fast history queries per DOMAIN_MODEL.md §8 (Normalization)
    milestone_id            UUID            NOT NULL,
    tx_hash                 VARCHAR(64)     NOT NULL,
    tx_type                 VARCHAR(30)     NOT NULL,
    network                 VARCHAR(20)     NOT NULL,
    amount_xlm              NUMERIC(20,7)   NOT NULL,
    asset_code              VARCHAR(12)     NOT NULL DEFAULT 'XLM',
    network_fee_xlm         NUMERIC(20,7)   NOT NULL DEFAULT 0,
    ledger_sequence         BIGINT          NOT NULL,
    initiated_by_wallet     VARCHAR(56)     NOT NULL,
    confirmed_at            TIMESTAMPTZ     NOT NULL,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_blockchain_transactions PRIMARY KEY (id),
    CONSTRAINT fk_blockchain_escrow FOREIGN KEY (escrow_contract_id)
        REFERENCES escrow_contracts(id) ON DELETE RESTRICT,
    CONSTRAINT fk_blockchain_milestone FOREIGN KEY (milestone_id)
        REFERENCES milestones(id) ON DELETE RESTRICT,
    CONSTRAINT uq_blockchain_tx_hash UNIQUE (tx_hash),
    CONSTRAINT chk_blockchain_tx_type CHECK (
        tx_type IN ('ESCROW_FUND', 'PAYMENT_RELEASE', 'REFUND', 'CONTRACT_DEPLOY')
    ),
    CONSTRAINT chk_blockchain_network CHECK (
        network IN ('TESTNET', 'MAINNET')
    ),
    CONSTRAINT chk_blockchain_amount CHECK (amount_xlm >= 0),
    CONSTRAINT chk_blockchain_fee CHECK (network_fee_xlm >= 0),
    CONSTRAINT chk_blockchain_ledger_positive CHECK (ledger_sequence > 0)
);

-- Indexes per DOMAIN_MODEL.md §6 (Tier 2)
CREATE INDEX idx_blockchain_escrow_id ON blockchain_transactions (escrow_contract_id);
CREATE INDEX idx_blockchain_milestone_id ON blockchain_transactions (milestone_id);
CREATE INDEX idx_blockchain_wallet ON blockchain_transactions (initiated_by_wallet);
-- BRIN index for time-series queries on confirmed_at
CREATE INDEX idx_blockchain_confirmed_at ON blockchain_transactions
    USING BRIN (confirmed_at) WITH (pages_per_range = 64);
