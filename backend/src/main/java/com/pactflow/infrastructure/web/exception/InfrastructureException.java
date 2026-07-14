package com.pactflow.infrastructure.web.exception;

/**
 * Base exception for infrastructure-layer failures.
 * Authority: SYSTEM_ARCHITECTURE.md §5.5
 */
public abstract class InfrastructureException extends PactFlowException {

    protected InfrastructureException(final String message) {
        super(message);
    }

    protected InfrastructureException(final String message, final Throwable cause) {
        super(message, cause);
    }
}
