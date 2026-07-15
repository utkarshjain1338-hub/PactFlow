package com.pactflow.application.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pactflow.domain.user.AccountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO returned after successful user registration (201 Created).
 * Authority: API_SPECIFICATION.md §POST /auth/register.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterResponse {
    private UUID id;
    private String email;
    private AccountType accountType;
    private String displayName;
    @JsonProperty("isEmailVerified")
    private boolean isEmailVerified;
    private Instant createdAt;
}
