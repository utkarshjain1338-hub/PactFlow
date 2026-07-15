-- =============================================================================
-- V14: Auto-managed updated_at trigger
-- Authority: DOMAIN_MODEL.md §8 (Audit Fields — "Auto-managed via BEFORE UPDATE trigger")
-- =============================================================================

-- Shared trigger function — updates updated_at on every row UPDATE
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at columns
-- Per DOMAIN_MODEL.md §8: all aggregate root tables have this trigger

CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_wallet_connections
    BEFORE UPDATE ON wallet_connections
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_projects
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_milestones
    BEFORE UPDATE ON milestones
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_comments
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_escrow_contracts
    BEFORE UPDATE ON escrow_contracts
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_daemon_state
    BEFORE UPDATE ON daemon_state
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
