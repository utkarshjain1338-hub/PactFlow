package com.pactflow.application.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

/**
 * Request DTO for user logout and session invalidation.
 */
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public record LogoutRequest(
        @NotBlank(message = "Refresh token is required") String refreshToken
) {}
