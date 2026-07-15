package com.pactflow.infrastructure.web.exception;

/**
 * Thrown when a refresh token reuse or replay attempt is detected during rotation.
 * Authority: SECURITY_THREAT_MODEL.md §4 (AT-05), API_SPECIFICATION.md Domain 1 (401 Token invalid/replayed).
 */
public class TokenReplayException extends PactFlowException {

    public TokenReplayException(final String message) {
        super(message);
    }
}
