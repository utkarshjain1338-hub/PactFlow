package com.pactflow.application.exception;

/**
 * Thrown when an authenticated attempt or login is made for a deactivated user.
 * Authority: API_SPECIFICATION.md Domain 1 (403 Account deactivated).
 */
public class AccountDeactivatedException extends PactFlowException {

    public AccountDeactivatedException(final String message) {
        super(message);
    }
}
