package com.pactflow.application.user.dto;

import com.pactflow.domain.user.AccountType;
import com.pactflow.domain.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO representing the authenticated user's full private profile.
 *
 * <p>Authority: API_SPECIFICATION.md Domain 2 (PATCH /users/me response body),
 * matching the exact schema of {@code GET /users/me}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {

    private UUID id;
    private String email;
    private AccountType accountType;
    private String displayName;
    private String avatarUrl;
    private String timezone;
    private String bio;
    private boolean isEmailVerified;
    private Instant createdAt;
    private Instant updatedAt;

    public static ProfileResponse from(final User user) {
        return ProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail() != null ? user.getEmail().getValue() : null)
                .accountType(user.getAccountType())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .timezone(user.getTimezone())
                .bio(user.getBio())
                .isEmailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
