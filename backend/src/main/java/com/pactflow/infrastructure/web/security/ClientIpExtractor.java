package com.pactflow.infrastructure.web.security;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Extracts the remote client IP address from HTTP requests, accounting for proxy headers.
 */
public final class ClientIpExtractor {

    private static final String X_FORWARDED_FOR = "X-Forwarded-For";

    private ClientIpExtractor() {}

    /**
     * Extracts the originating client IP address.
     *
     * @param request HTTP request
     * @return client IP string
     */
    public static String from(final HttpServletRequest request) {
        final String xForwardedFor = request.getHeader(X_FORWARDED_FOR);
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
