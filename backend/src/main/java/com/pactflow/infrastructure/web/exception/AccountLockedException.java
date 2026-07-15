package com.pactflow.infrastructure.web.exception;

/**
 * Thrown when an account is locked after consecutive failed login attempts.
 * Authority: SECURITY_THREAT_MODEL.md §4 (AT-01/AT-02 Account Lockout).
 */
public class AccountLockedException extends PactFlowException {

    public AccountLockedException(final String message) {
        super(message);
    }
}
