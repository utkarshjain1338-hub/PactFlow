-- =============================================================================
-- V3: Create projects table
-- Authority: DOMAIN_MODEL.md §6 (projects specification)
-- PROJECT_CONSTITUTION.md §7 (The Pact Flow — lifecycle)
-- =============================================================================

CREATE TABLE IF NOT EXISTS projects (
    id              UUID            NOT NULL,
    client_id       UUID            NOT NULL,
    assignee_id     UUID            NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    description     TEXT,
    status          VARCHAR(20)     NOT NULL DEFAULT 'DRAFT',
    total_budget_xlm NUMERIC(20,7)  NOT NULL,
    asset_code      VARCHAR(12)     NOT NULL DEFAULT 'XLM',
    deadline        DATE,
    is_deleted      BOOLEAN         NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    version         BIGINT          NOT NULL DEFAULT 1,

    CONSTRAINT pk_projects PRIMARY KEY (id),
    CONSTRAINT fk_project_client FOREIGN KEY (client_id)
        REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_project_assignee FOREIGN KEY (assignee_id)
        REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_projects_status CHECK (
        status IN ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
    ),
    CONSTRAINT chk_projects_budget_positive CHECK (total_budget_xlm > 0),
    CONSTRAINT chk_projects_title_length CHECK (char_length(title) >= 5),
    CONSTRAINT chk_projects_description_length CHECK (
        description IS NULL OR char_length(description) <= 5000
    ),
    -- DOMAIN_MODEL.md §6: "client_id <> assignee_id"
    CONSTRAINT chk_projects_client_ne_assignee CHECK (client_id <> assignee_id)
);

-- Indexes per DOMAIN_MODEL.md §6
CREATE INDEX idx_projects_client_id ON projects (client_id);
CREATE INDEX idx_projects_assignee_id ON projects (assignee_id);
CREATE INDEX idx_projects_status ON projects (status);
CREATE INDEX idx_projects_created_at ON projects (created_at DESC);
