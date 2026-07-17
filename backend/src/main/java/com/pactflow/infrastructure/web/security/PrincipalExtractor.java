package com.pactflow.infrastructure.web.security;

import com.pactflow.application.auth.dto.UserSummaryDto;
import com.pactflow.infrastructure.web.exception.AuthorizationException;

import java.util.UUID;

/**
 * Extracts the authenticated user's UUID from Spring Security principal objects.
 */
public final class PrincipalExtractor {

    private PrincipalExtractor() {}

    /**
     * Extracts the user UUID from various Spring Security principal types.
     *
     * @param principal security principal from context
     * @return extracted UUID v7
     * @throws AuthorizationException if principal cannot be resolved to a valid UUID
     */
    public static UUID extractUserId(final Object principal) {
        if (principal instanceof UUID uuid) {
            return uuid;
        } else if (principal instanceof UserSummaryDto summary) {
            return summary.id();
        } else if (principal instanceof String str) {
            try {
                return UUID.fromString(str);
            } catch (final IllegalArgumentException ignored) {
                // fall through to exception throw below
            }
        }
        throw new AuthorizationException("Valid user authentication principal is required.");
    }
}
