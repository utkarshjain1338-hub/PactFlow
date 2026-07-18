package com.pactflow.application.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pactflow.domain.user.AccountType;
import com.pactflow.domain.user.User;
import lombok.Builder;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO returned by GET /auth/me with full authenticated profile including wallets.
 */
@Builder
public record UserMeResponse(
        UUID id,
        String email,
        AccountType accountType,
        String displayName,
        String avatarUrl,
        String timezone,
        String bio,
        @JsonProperty("isEmailVerified") boolean isEmailVerified,
        @JsonProperty("isActive") boolean isActive,
        List<WalletSummaryDto> wallets,
        Instant createdAt,
        Instant updatedAt
) {
    /**
     * Compact constructor guaranteeing non-null wallet list.
     */
    public UserMeResponse {
        if (wallets == null) {
            wallets = new ArrayList<>();
        }
    }

    /**
     * Converts a User domain entity to a UserMeResponse DTO.
     *
     * @param user domain entity
     * @return current user DTO
     */
    public static UserMeResponse from(final User user) {
        return new UserMeResponse(
                user.getId(),
                user.getEmail().getValue(),
                user.getAccountType(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getTimezone(),
                user.getBio(),
                user.isEmailVerified(),
                user.isActive(),
                new ArrayList<>(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
