package com.pactflow.application.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pactflow.domain.user.AccountType;
import com.pactflow.domain.user.User;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO returned after successful user registration (201 Created).
 */
@Builder
public record RegisterResponse(
        UUID id,
        String email,
        AccountType accountType,
        String displayName,
        @JsonProperty("isEmailVerified") boolean isEmailVerified,
        Instant createdAt
) {
    /**
     * Converts a User domain entity to a RegisterResponse DTO.
     *
     * @param user domain entity
     * @return registration DTO response
     */
    public static RegisterResponse from(final User user) {
        return new RegisterResponse(
                user.getId(),
                user.getEmail().getValue(),
                user.getAccountType(),
                user.getDisplayName(),
                user.isEmailVerified(),
                user.getCreatedAt()
        );
    }
}
