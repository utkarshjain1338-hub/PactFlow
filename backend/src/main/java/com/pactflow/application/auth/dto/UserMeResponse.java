package com.pactflow.application.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pactflow.domain.user.AccountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO returned by GET /auth/me with full authenticated profile including wallets.
 * Authority: API_SPECIFICATION.md §GET /auth/me.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserMeResponse {
    private UUID id;
    private String email;
    private AccountType accountType;
    private String displayName;
    private String avatarUrl;
    private String timezone;
    private String bio;
    @JsonProperty("isEmailVerified")
    private boolean isEmailVerified;
    @JsonProperty("isActive")
    private boolean isActive;
    @Builder.Default
    private List<WalletSummaryDto> wallets = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;
}
