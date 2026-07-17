package com.pactflow.application.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

/**
 * Request DTO for refresh token rotation.
 */
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public record RefreshTokenRequest(
        @NotBlank(message = "Refresh token is required") String refreshToken
) {}
