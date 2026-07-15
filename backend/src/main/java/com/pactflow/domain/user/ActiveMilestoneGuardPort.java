package com.pactflow.domain.user;

import java.util.UUID;

/**
 * Narrow, read-only port interface for checking active milestones before account erasure.
 *
 * <p>Authority: API_SPECIFICATION.md Domain 2 (DELETE /users/me Business Rules),
 * DOMAIN_MODEL.md §8, PROJECT_CONSTITUTION.md (Clean Architecture Seams).
 *
 * <p>Acts as an anti-corruption layer seam between the Identity bounded context
 * and the Collaboration/Milestones bounded context. Implemented at the
 * infrastructure layer using a narrow, indexed SQL query against projects and milestones.
 */
public interface ActiveMilestoneGuardPort {

    /**
     * Checks if a user (either as client or assignee) has any active milestones
     * in FUNDED, IN_PROGRESS, or SUBMITTED state across their non-deleted projects.
     *
     * @param userId user UUID v7 to check
     * @return true if at least one active milestone exists preventing erasure
     */
    boolean hasActiveMilestones(UUID userId);
}
