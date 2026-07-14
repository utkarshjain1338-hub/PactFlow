package com.pactflow.domain.shared;

import java.time.Instant;

/**
 * Mixin interface for entities that support soft deletion.
 *
 * <p>Per DOMAIN_MODEL.md §8 (Soft Delete Rules):
 * Hard deletes are prohibited except for user_sessions (TTL) and GDPR erasure.
 * All queries must include {@code WHERE is_deleted = false} in base filters.
 */
public interface SoftDeletable {

    /**
     * Whether this entity has been soft-deleted.
     *
     * @return true if deleted, false if active
     */
    boolean isDeleted();

    /**
     * The timestamp at which this entity was soft-deleted, or null if active.
     *
     * @return deletion instant, or null
     */
    Instant getDeletedAt();
}
