-- =============================================================================
-- V17: Add wallet references to projects
-- =============================================================================

-- Rename existing user reference columns to match Domain semantics
ALTER TABLE projects RENAME COLUMN client_id TO client_user_id;
ALTER TABLE projects RENAME COLUMN assignee_id TO freelancer_user_id;

-- Add wallet reference columns
ALTER TABLE projects ADD COLUMN client_wallet_id UUID;
ALTER TABLE projects ADD COLUMN freelancer_wallet_id UUID;

-- Add constraints
ALTER TABLE projects ADD CONSTRAINT fk_projects_client_wallet 
    FOREIGN KEY (client_wallet_id) REFERENCES wallet_connections(id) ON DELETE SET NULL;
    
ALTER TABLE projects ADD CONSTRAINT fk_projects_freelancer_wallet 
    FOREIGN KEY (freelancer_wallet_id) REFERENCES wallet_connections(id) ON DELETE SET NULL;

CREATE INDEX idx_projects_client_wallet_id ON projects (client_wallet_id);
CREATE INDEX idx_projects_freelancer_wallet_id ON projects (freelancer_wallet_id);
