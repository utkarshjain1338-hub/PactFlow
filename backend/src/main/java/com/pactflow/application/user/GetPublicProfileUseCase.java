package com.pactflow.application.user;

import com.pactflow.application.user.dto.PublicProfileResponse;

import java.util.UUID;

/**
 * Use case interface for retrieving a user's safe public profile.
 * Authority: API_SPECIFICATION.md Domain 2 (GET /users/{id}/profile).
 */
public interface GetPublicProfileUseCase {

    /**
     * Retrieves the public profile of any non-deleted user.
     *
     * @param userId target user UUID
     * @return safe public profile representation excluding sensitive fields
     */
    PublicProfileResponse getPublicProfile(UUID userId);
}
