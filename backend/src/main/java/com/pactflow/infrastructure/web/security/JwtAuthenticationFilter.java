package com.pactflow.infrastructure.web.security;

import com.pactflow.application.auth.dto.UserSummaryDto;
import com.pactflow.domain.user.AccountType;
import com.pactflow.infrastructure.persistence.UserSessionRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * OncePerRequestFilter enforcing the JWT token validation pipeline.
 *
 * <p>Authority: SYSTEM_ARCHITECTURE.md §8.3 (Token Validation Pipeline).
 *
 * <p>Pipeline steps:
 * 1. Extract Bearer token from Authorization header.
 * 2. Verify HS256 signature and expiration via JwtService.
 * 3. Verify session liveness in Redis/PostgreSQL via UserSessionRepository (`sessionId` claim).
 * 4. Populate SecurityContextHolder with UserSummaryDto principal and `ROLE_{AccountType}` authority.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger LOG = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final UserSessionRepository sessionRepository;

    @Override
    protected void doFilterInternal(
            @NonNull final HttpServletRequest request,
            @NonNull final HttpServletResponse response,
            @NonNull final FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith(BEARER_PREFIX)) {
            final String token = authHeader.substring(BEARER_PREFIX.length()).trim();
            jwtService.parseAndValidateClaims(token)
                    .ifPresent(claims -> processAuthentication(claims, request));
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(@NonNull final HttpServletRequest request) {
        final String path = request.getRequestURI();
        return path != null && (
                path.startsWith("/api/v1/health") ||
                path.startsWith("/actuator") ||
                path.startsWith("/api-docs") ||
                path.startsWith("/swagger-ui")
        );
    }

    private void processAuthentication(final Claims claims, final HttpServletRequest request) {
        final String sessionIdStr = claims.get("sessionId", String.class);
        if (sessionIdStr == null) {
            LOG.warn("JWT missing required sessionId claim for URI: {}", request.getRequestURI());
            return;
        }

        final UUID sessionId;
        try {
            sessionId = UUID.fromString(sessionIdStr);
        } catch (final IllegalArgumentException e) {
            LOG.warn("Malformed sessionId claim in JWT: {}", sessionIdStr);
            return;
        }

        if (!sessionRepository.isSessionActive(sessionId)) {
            LOG.warn("JWT rejected due to revoked or inactive session: {}", sessionId);
            return;
        }

        final String userIdStr = claims.getSubject();
        final String email = claims.get("email", String.class);
        final String accountTypeStr = claims.get("accountType", String.class);

        if (userIdStr != null && accountTypeStr != null
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                final UUID userId = UUID.fromString(userIdStr);
                final AccountType accountType = AccountType.valueOf(accountTypeStr);

                final UserSummaryDto principal = UserSummaryDto.builder()
                        .id(userId)
                        .email(email != null ? email : "")
                        .accountType(accountType)
                        .displayName("")
                        .build();

                final UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + accountType.name()))
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authToken);
                LOG.debug("Authenticated user {} with role {}", userId, accountType);
            } catch (final Exception e) {
                LOG.warn("Error establishing authentication principal from claims: {}", e.getMessage());
            }
        }
    }
}
