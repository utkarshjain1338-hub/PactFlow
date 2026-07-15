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
 * Response DTO representing a user's safe public profile.
 *
 * <p>Authority: API_SPECIFICATION.md Domain 2 (GET /users/{id}/profile response body),
 * DOMAIN_MODEL.md §8 item 4 (Data Exposure Protection).
 *
 * <p>Intentionally excludes sensitive fields such as {@code email}, {@code isEmailVerified},
 * {@code timezone}, and {@code updatedAt}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicProfileResponse {

    private UUID id;
    private String displayName;
    private String avatarUrl;
    private String bio;
    private AccountType accountType;
    private Instant createdAt;

    public static PublicProfileResponse from(final User user) {
        return PublicProfileResponse.builder()
                .id(user.getId())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .accountType(user.getAccountType())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
