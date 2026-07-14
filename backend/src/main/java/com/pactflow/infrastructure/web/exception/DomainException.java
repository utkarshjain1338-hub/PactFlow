package com.pactflow.infrastructure.web.exception;

/**
 * Exception thrown when a domain invariant is violated.
 * Authority: SYSTEM_ARCHITECTURE.md §5.5
 */
public class DomainException extends PactFlowException {

    public DomainException(final String message) {
        super(message);
    }

    public DomainException(final String message, final Throwable cause) {
        super(message, cause);
    }
}
