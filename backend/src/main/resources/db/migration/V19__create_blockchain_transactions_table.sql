-- =============================================================================
-- V19: Create blockchain_transactions table
-- =============================================================================

DROP TABLE IF EXISTS blockchain_transactions CASCADE;

CREATE TABLE blockchain_transactions (
    id UUID PRIMARY KEY,
    escrow_id UUID NOT NULL,
    transaction_hash VARCHAR(64) NOT NULL UNIQUE,
    operation VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    ledger BIGINT,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    version BIGINT NOT NULL DEFAULT 1,

    CONSTRAINT fk_blockchain_tx_escrow
        FOREIGN KEY (escrow_id)
        REFERENCES escrows(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_blockchain_tx_escrow_id ON blockchain_transactions(escrow_id);
CREATE INDEX idx_blockchain_tx_status ON blockchain_transactions(status);
