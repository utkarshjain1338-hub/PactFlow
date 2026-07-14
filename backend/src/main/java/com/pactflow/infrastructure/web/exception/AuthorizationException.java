package com.pactflow.infrastructure.web.exception;

/**
 * Thrown when the authenticated user lacks ownership or role permissions.
 * Maps to HTTP 403 Forbidden.
 * Authority: SYSTEM_ARCHITECTURE.md §5.5, §8.4 (RBAC)
 */
public class AuthorizationException extends ApplicationException {

    public AuthorizationException(final String message) {
        super(message);
    }
}
