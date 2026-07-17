package com.pactflow.infrastructure.web.exception;

/**
 * Thrown when application-level validation fails (distinct from @Valid bean validation).
 * Maps to HTTP 422 Unprocessable Entity.
 * Authority: SYSTEM_ARCHITECTURE.md §5.5, API_SPECIFICATION.md §1.4 (Layer 3)
 */
public class ValidationException extends PactFlowException {

    public ValidationException(final String message) {
        super(message);
    }
}
