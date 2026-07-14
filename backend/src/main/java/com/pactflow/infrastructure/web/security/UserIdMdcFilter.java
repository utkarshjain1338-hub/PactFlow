package com.pactflow.infrastructure.web.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter that adds the authenticated user ID to MDC after JWT validation.
 *
 * <p>Per SYSTEM_ARCHITECTURE.md §12.2 (Structured Logging):
 * Every log entry includes a {@code userId} field for user-level audit.
 *
 * <p>Runs after the JWT auth filter (order 2). The MDC userId is null
 * for unauthenticated requests.
 */
@Component
@Order(2)
public class UserIdMdcFilter extends OncePerRequestFilter {

    private static final String MDC_USER_ID_KEY = "userId";

    @Override
    protected void doFilterInternal(
            @NonNull final HttpServletRequest request,
            @NonNull final HttpServletResponse response,
            @NonNull final FilterChain filterChain) throws ServletException, IOException {

        try {
            final Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                MDC.put(MDC_USER_ID_KEY, auth.getName());
            }
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_USER_ID_KEY);
        }
    }
}
