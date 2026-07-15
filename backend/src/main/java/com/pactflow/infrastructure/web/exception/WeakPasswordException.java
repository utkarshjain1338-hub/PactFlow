package com.pactflow.infrastructure.web.exception;

/**
 * Thrown when a password does not satisfy complexity requirements during registration or reset.
 * Authority: API_SPECIFICATION.md Domain 1 (422 Password too weak).
 */
public class WeakPasswordException extends PactFlowException {

    public WeakPasswordException(final String message) {
        super(message);
    }
}
