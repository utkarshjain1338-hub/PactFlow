package com.pactflow.infrastructure.web.exception;

/**
 * Thrown when an email verification or password reset token has expired or has already been consumed.
 * Authority: API_SPECIFICATION.md Domain 1 (410 Token expired or used).
 */
public class TokenExpiredException extends PactFlowException {

    public TokenExpiredException(final String message) {
        super(message);
    }
}
