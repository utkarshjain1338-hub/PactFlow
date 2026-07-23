-- =============================================================================
-- V16: Update schema for Project Aggregate Refactoring
-- =============================================================================

-- Make assignee_id optional during draft
ALTER TABLE projects ALTER COLUMN assignee_id DROP NOT NULL;

-- Update status check constraint for projects
ALTER TABLE projects DROP CONSTRAINT chk_projects_status;
ALTER TABLE projects ADD CONSTRAINT chk_projects_status CHECK (
    status IN ('DRAFT', 'OPEN', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED', 'ARCHIVED')
);

-- Update status check constraint for milestones
ALTER TABLE milestones DROP CONSTRAINT chk_milestones_status;
ALTER TABLE milestones ADD CONSTRAINT chk_milestones_status CHECK (
    status IN ('DRAFT', 'FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PAID', 'REFUNDED', 'DISPUTED', 'CANCELLED')
);

-- Alter deliverables table to match new schema
ALTER TABLE deliverables DROP COLUMN delivery_url;
ALTER TABLE deliverables DROP COLUMN delivery_type;
ALTER TABLE deliverables DROP COLUMN created_at;

ALTER TABLE deliverables ADD COLUMN file_url VARCHAR(500);
ALTER TABLE deliverables ADD COLUMN repository_url VARCHAR(500);
ALTER TABLE deliverables ADD COLUMN commit_hash VARCHAR(100);
ALTER TABLE deliverables ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED';

ALTER TABLE deliverables ADD CONSTRAINT chk_deliverables_status CHECK (
    status IN ('SUBMITTED', 'ACCEPTED', 'REJECTED')
);
