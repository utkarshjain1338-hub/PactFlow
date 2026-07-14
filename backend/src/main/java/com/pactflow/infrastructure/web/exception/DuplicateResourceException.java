package com.pactflow.infrastructure.web.exception;

/**
 * Thrown when a creation request would produce a duplicate unique resource.
 * Maps to HTTP 409 Conflict.
 * Authority: SYSTEM_ARCHITECTURE.md §5.5
 */
public class DuplicateResourceException extends ApplicationException {

    public DuplicateResourceException(final String message) {
        super(message);
    }
}
