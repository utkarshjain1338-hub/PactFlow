package com.pactflow.infrastructure.web.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Filter that adds a unique request ID to MDC for structured log correlation.
 *
 * <p>Per SYSTEM_ARCHITECTURE.md §12.2 (Structured Logging):
 * Every log entry includes a {@code requestId} field for request tracing.
 *
 * <p>The {@code X-Request-Id} header is checked first. If not present,
 * a new UUID is generated. The ID is also returned in the response header.
 */
@Component
@Order(1)
public class RequestIdFilter extends OncePerRequestFilter {

    private static final String REQUEST_ID_HEADER = "X-Request-Id";
    private static final String MDC_REQUEST_ID_KEY = "requestId";

    @Override
    protected void doFilterInternal(
            @NonNull final HttpServletRequest request,
            @NonNull final HttpServletResponse response,
            @NonNull final FilterChain filterChain) throws ServletException, IOException {

        final String requestId = getOrGenerateRequestId(request);

        try {
            MDC.put(MDC_REQUEST_ID_KEY, requestId);
            response.setHeader(REQUEST_ID_HEADER, requestId);
            filterChain.doFilter(request, response);
        } finally {
            // Always clean up MDC to prevent thread pool pollution
            MDC.remove(MDC_REQUEST_ID_KEY);
        }
    }

    private String getOrGenerateRequestId(final HttpServletRequest request) {
        final String existingId = request.getHeader(REQUEST_ID_HEADER);
        if (existingId != null && !existingId.isBlank() && existingId.length() <= 64) {
            return existingId;
        }
        return "req_" + UUID.randomUUID().toString().replace("-", "");
    }
}
