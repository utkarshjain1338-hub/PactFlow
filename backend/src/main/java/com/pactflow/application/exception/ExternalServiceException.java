package com.pactflow.application.exception;

/**
 * Thrown when an external service dependency (email, third-party API) is unavailable.
 * Maps to HTTP 503 Service Unavailable.
 * Authority: SYSTEM_ARCHITECTURE.md §5.5
 */
public class ExternalServiceException extends PactFlowException {

    public ExternalServiceException(final String message) {
        super(message);
    }

    public ExternalServiceException(final String message, final Throwable cause) {
        super(message, cause);
    }
}
