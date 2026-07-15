-- =============================================================================
-- V4: Create milestones and deliverables tables
-- Authority: DOMAIN_MODEL.md §6 (milestones, deliverables specifications)
-- PROJECT_CONSTITUTION.md §7: milestone state machine DRAFT→FUNDED→IN_PROGRESS→...
-- =============================================================================

CREATE TABLE IF NOT EXISTS milestones (
    id                  UUID            NOT NULL,
    project_id          UUID            NOT NULL,
    title               VARCHAR(200)    NOT NULL,
    description         TEXT,
    amount_xlm          NUMERIC(20,7)   NOT NULL,
    asset_code          VARCHAR(12)     NOT NULL DEFAULT 'XLM',
    status              VARCHAR(20)     NOT NULL DEFAULT 'DRAFT',
    sequence_order      INTEGER         NOT NULL,
    due_date            DATE,
    is_strict_deadline  BOOLEAN         NOT NULL DEFAULT FALSE,
    is_deleted          BOOLEAN         NOT NULL DEFAULT FALSE,
    deleted_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    version             BIGINT          NOT NULL DEFAULT 1,

    CONSTRAINT pk_milestones PRIMARY KEY (id),
    CONSTRAINT fk_milestone_project FOREIGN KEY (project_id)
        REFERENCES projects(id) ON DELETE RESTRICT,
    CONSTRAINT chk_milestones_status CHECK (
        status IN ('DRAFT', 'FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'PAID', 'REFUNDED')
    ),
    CONSTRAINT chk_milestones_amount_positive CHECK (amount_xlm > 0),
    CONSTRAINT chk_milestones_title_length CHECK (char_length(title) >= 3),
    CONSTRAINT chk_milestones_description_length CHECK (
        description IS NULL OR char_length(description) <= 3000
    ),
    CONSTRAINT chk_milestones_sequence_order_positive CHECK (sequence_order >= 1)
);

-- Unique sequence_order per project (partial — excludes deleted)
-- DOMAIN_MODEL.md §6: "uq_milestone_sequence_per_project: UNIQUE (project_id, sequence_order) WHERE is_deleted=false"
CREATE UNIQUE INDEX uq_milestone_sequence_per_project
    ON milestones (project_id, sequence_order)
    WHERE is_deleted = FALSE;

-- Indexes per DOMAIN_MODEL.md §6
CREATE INDEX idx_milestones_project_id ON milestones (project_id);
CREATE INDEX idx_milestones_status ON milestones (status);
-- Composite index for dashboard queries (project + status filter)
CREATE INDEX idx_milestones_project_status ON milestones (project_id, status);


-- ─── DELIVERABLES ────────────────────────────────────────────────────────────
-- DOMAIN_MODEL.md §6: "Deliverables are immutable submission records. No soft delete."
CREATE TABLE IF NOT EXISTS deliverables (
    id              UUID            NOT NULL,
    milestone_id    UUID            NOT NULL,
    submitted_by    UUID            NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    description     TEXT,
    delivery_url    VARCHAR(2048)   NOT NULL,
    delivery_type   VARCHAR(30)     NOT NULL,
    submitted_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_deliverables PRIMARY KEY (id),
    CONSTRAINT fk_deliverable_milestone FOREIGN KEY (milestone_id)
        REFERENCES milestones(id) ON DELETE RESTRICT,
    CONSTRAINT fk_deliverable_submitted_by FOREIGN KEY (submitted_by)
        REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_deliverable_type CHECK (
        delivery_type IN ('LINK', 'GITHUB_PR', 'FIGMA', 'DOCUMENT', 'OTHER')
    )
);

CREATE INDEX idx_deliverables_milestone_id ON deliverables (milestone_id);
CREATE INDEX idx_deliverables_submitted_by ON deliverables (submitted_by);
