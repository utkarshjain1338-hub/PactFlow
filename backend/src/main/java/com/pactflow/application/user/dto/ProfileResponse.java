package com.pactflow.application.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pactflow.domain.user.AccountType;
import com.pactflow.domain.user.User;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO representing the authenticated user's full private profile.
 */
@Builder
public record ProfileResponse(
        UUID id,
        String email,
        AccountType accountType,
        String displayName,
        String avatarUrl,
        String timezone,
        String bio,
        @JsonProperty("isEmailVerified") boolean isEmailVerified,
        Instant createdAt,
        Instant updatedAt
) {
    /**
     * Converts a User domain entity to a ProfileResponse DTO.
     *
     * @param user domain entity
     * @return DTO response
     */
    public static ProfileResponse from(final User user) {
        return new ProfileResponse(
                user.getId(),
                user.getEmail() != null ? user.getEmail().getValue() : null,
                user.getAccountType(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getTimezone(),
                user.getBio(),
                user.isEmailVerified(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
