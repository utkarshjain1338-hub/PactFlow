package com.pactflow.infrastructure.web.exception;

/**
 * Base exception for all PactFlow-specific exceptions.
 * Authority: SYSTEM_ARCHITECTURE.md §5.5 (Exception Hierarchy).
 */
public abstract class PactFlowException extends RuntimeException {

    protected PactFlowException(final String message) {
        super(message);
    }

    protected PactFlowException(final String message, final Throwable cause) {
        super(message, cause);
    }
}
