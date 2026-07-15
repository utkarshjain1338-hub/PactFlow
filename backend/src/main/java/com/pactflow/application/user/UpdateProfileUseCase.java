package com.pactflow.application.user;

import com.pactflow.application.user.dto.ProfileResponse;
import com.pactflow.application.user.dto.UpdateProfileRequest;

import java.util.UUID;

/**
 * Use case interface for updating the authenticated user's profile.
 * Authority: API_SPECIFICATION.md Domain 2 (PATCH /users/me).
 */
public interface UpdateProfileUseCase {

    /**
     * Updates profile fields for the authenticated user.
     *
     * @param userId  authenticated user UUID
     * @param request profile update request containing allowlisted fields
     * @return updated private profile representation
     */
    ProfileResponse updateProfile(UUID userId, UpdateProfileRequest request);
}
