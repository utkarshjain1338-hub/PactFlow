package com.pactflow.application.user.dto;

import com.pactflow.domain.user.AccountType;
import com.pactflow.domain.user.User;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO representing a user's safe public profile.
 */
@Builder
public record PublicProfileResponse(
        UUID id,
        String displayName,
        String avatarUrl,
        String bio,
        AccountType accountType,
        Instant createdAt
) {
    /**
     * Converts a User domain entity to a safe PublicProfileResponse DTO.
     *
     * @param user domain entity
     * @return public DTO response
     */
    public static PublicProfileResponse from(final User user) {
        return new PublicProfileResponse(
                user.getId(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getBio(),
                user.getAccountType(),
                user.getCreatedAt()
        );
    }
}
