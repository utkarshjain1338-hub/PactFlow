package com.pactflow.infrastructure.web.exception;

/**
 * Base exception for application-layer errors.
 * Authority: SYSTEM_ARCHITECTURE.md §5.5
 */
public abstract class ApplicationException extends PactFlowException {

    protected ApplicationException(final String message) {
        super(message);
    }

    protected ApplicationException(final String message, final Throwable cause) {
        super(message, cause);
    }
}
