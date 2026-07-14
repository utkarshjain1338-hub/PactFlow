package com.pactflow.infrastructure.web.exception;

/**
 * Thrown when a business rule is violated (e.g. client == assignee).
 * Maps to HTTP 409 Conflict.
 * Authority: SYSTEM_ARCHITECTURE.md §5.5, PROJECT_CONSTITUTION.md §7.
 */
public class BusinessRuleViolationException extends DomainException {

    public BusinessRuleViolationException(final String message) {
        super(message);
    }
}
