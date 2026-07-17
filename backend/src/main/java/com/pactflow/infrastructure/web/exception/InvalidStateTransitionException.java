package com.pactflow.infrastructure.web.exception;

/**
 * Thrown when an entity cannot transition to the requested state from its current state.
 * Maps to HTTP 409 Conflict.
 * Authority: SYSTEM_ARCHITECTURE.md §5.5, DOMAIN_MODEL.md §4 (State Machines).
 */
public class InvalidStateTransitionException extends PactFlowException {

    public InvalidStateTransitionException(
            final String entityType,
            final String currentStatus,
            final String targetStatus) {
        super(entityType + " cannot transition from '" + currentStatus + "' to '" + targetStatus + "'.");
    }

    public InvalidStateTransitionException(final String message) {
        super(message);
    }
}
