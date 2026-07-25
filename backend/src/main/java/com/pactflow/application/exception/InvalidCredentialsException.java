package com.pactflow.application.exception;

/**
 * Thrown when authentication credentials (email/password) are invalid.
 * Authority: API_SPECIFICATION.md Domain 1 (401 Invalid credentials).
 */
public class InvalidCredentialsException extends PactFlowException {

    public InvalidCredentialsException(final String message) {
        super(message);
    }
}
