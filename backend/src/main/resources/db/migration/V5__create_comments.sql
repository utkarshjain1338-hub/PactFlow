-- =============================================================================
-- V5: Create comments table
-- Authority: DOMAIN_MODEL.md §6 (comments specification)
-- =============================================================================

CREATE TABLE IF NOT EXISTS comments (
    id              UUID            NOT NULL,
    author_id       UUID            NOT NULL,
    project_id      UUID,
    milestone_id    UUID,
    content         TEXT            NOT NULL,
    is_deleted      BOOLEAN         NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_comments PRIMARY KEY (id),
    CONSTRAINT fk_comment_author FOREIGN KEY (author_id)
        REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_comment_project FOREIGN KEY (project_id)
        REFERENCES projects(id) ON DELETE RESTRICT,
    CONSTRAINT fk_comment_milestone FOREIGN KEY (milestone_id)
        REFERENCES milestones(id) ON DELETE RESTRICT,
    CONSTRAINT chk_comments_content_length CHECK (
        char_length(content) BETWEEN 1 AND 5000
    ),
    -- DOMAIN_MODEL.md §6: XOR constraint — exactly one parent
    CONSTRAINT chk_comments_parent_xor CHECK (
        (project_id IS NOT NULL AND milestone_id IS NULL)
        OR (project_id IS NULL AND milestone_id IS NOT NULL)
    )
);

CREATE INDEX idx_comments_project_id ON comments (project_id);
CREATE INDEX idx_comments_milestone_id ON comments (milestone_id);
CREATE INDEX idx_comments_author_id ON comments (author_id);
