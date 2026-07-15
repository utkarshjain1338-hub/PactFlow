package com.pactflow.application.user;

import com.pactflow.application.auth.dto.MessageResponse;

import java.util.UUID;

/**
 * Use case interface for requesting account soft-deletion and GDPR erasure.
 * Authority: API_SPECIFICATION.md Domain 2 (DELETE /users/me).
 */
public interface RequestAccountErasureUseCase {

    /**
     * Initiates account erasure after verifying no active milestones exist.
     *
     * @param userId authenticated user UUID
     * @return 202 Accepted message indicating 30-day asynchronous PII erasure
     */
    MessageResponse requestAccountErasure(UUID userId);
}
