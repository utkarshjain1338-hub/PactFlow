package com.pactflow.application.exception;

/**
 * Thrown when Soroban RPC or Horizon communication fails.
 * Maps to HTTP 503 Service Unavailable.
 * Authority: SYSTEM_ARCHITECTURE.md §5.5, §6.6 (Retry and Failure Recovery)
 */
public class BlockchainCommunicationException extends PactFlowException {

    public BlockchainCommunicationException(final String message) {
        super(message);
    }

    public BlockchainCommunicationException(final String message, final Throwable cause) {
        super(message, cause);
    }
}
