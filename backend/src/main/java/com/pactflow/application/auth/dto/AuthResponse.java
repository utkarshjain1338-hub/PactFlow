package com.pactflow.application.auth.dto;

import lombok.Builder;

/**
 * Response DTO returned after successful authentication or refresh.
 */
@Builder
public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        UserSummaryDto user
) {
    /**
     * Compact constructor enforcing default values for tokenType and expiresIn.
     */
    public AuthResponse {
        if (tokenType == null) {
            tokenType = "Bearer";
        }
        if (expiresIn <= 0) {
            expiresIn = 900L;
        }
    }
}
