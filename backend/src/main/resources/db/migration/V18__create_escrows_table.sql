-- =============================================================================
-- V18: Create escrows table
-- =============================================================================

CREATE TABLE escrows (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL,
    milestone_id UUID NOT NULL,
    contract_id VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    funded_amount NUMERIC(20, 7) NOT NULL DEFAULT 0,
    funded_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    transaction_references TEXT,
    
    version BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    CONSTRAINT fk_escrows_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_escrows_milestone FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE,
    CONSTRAINT uq_escrows_milestone UNIQUE (milestone_id)
);

CREATE INDEX idx_escrows_project_id ON escrows(project_id);
