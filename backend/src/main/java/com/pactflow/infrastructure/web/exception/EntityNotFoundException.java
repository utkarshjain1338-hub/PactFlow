package com.pactflow.infrastructure.web.exception;

import java.util.UUID;

/**
 * Thrown when a requested entity does not exist or has been soft-deleted.
 * Maps to HTTP 404 Not Found.
 * Authority: SYSTEM_ARCHITECTURE.md §5.5
 */
public class EntityNotFoundException extends DomainException {

    public EntityNotFoundException(final String entityType, final UUID id) {
        super(entityType + " with id '" + id + "' was not found.");
    }

    public EntityNotFoundException(final String message) {
        super(message);
    }
}
