-- =============================================================================
-- V15: Add anonymize_user database function for GDPR PII erasure
-- Authority: DOMAIN_MODEL.md §8 item 7 & §12.7, API_SPECIFICATION.md Domain 2
-- =============================================================================

CREATE OR REPLACE FUNCTION anonymize_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE users
    SET email = NULL,
        display_name = NULL,
        avatar_url = NULL,
        bio = NULL,
        password_hash = NULL,
        is_active = FALSE,
        is_deleted = TRUE,
        deleted_at = COALESCE(deleted_at, NOW()),
        updated_at = NOW(),
        version = version + 1
    WHERE id = target_user_id
      AND (email IS NOT NULL OR display_name IS NOT NULL OR avatar_url IS NOT NULL OR bio IS NOT NULL OR password_hash IS NOT NULL);
END;
$$;
