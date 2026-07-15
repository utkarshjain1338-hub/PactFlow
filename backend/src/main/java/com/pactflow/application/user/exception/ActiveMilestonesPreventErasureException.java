package com.pactflow.application.user.exception;

import com.pactflow.infrastructure.web.exception.BusinessRuleViolationException;

/**
 * Thrown when a user attempts to request account erasure while possessing active milestones.
 *
 * <p>Authority: API_SPECIFICATION.md Domain 2 (DELETE /users/me Business Rules & Error Responses).
 * Results in HTTP 409 Conflict with code ACTIVE_MILESTONES_PREVENT_ERASURE.
 */
public class ActiveMilestonesPreventErasureException extends BusinessRuleViolationException {

    public ActiveMilestonesPreventErasureException() {
        super("Active escrows prevent deletion");
    }
}
