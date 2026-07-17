package com.pactflow.infrastructure.web.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pactflow.infrastructure.config.PactFlowProperties;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limit filter enforcing tiered endpoint protection via Bucket4j.
 *
 * <p>Authority: API_SPECIFICATION.md §1.8 (Rate Limiting Tiers), SECURITY_THREAT_MODEL.md §13.
 *
 * <p>Enforces:
 * - 10 requests/minute per IP across `/api/v1/auth/**` endpoints generally (`authEndpointsRpm`).
 * - 3 requests/hour per IP specifically on `/api/v1/auth/forgot-password` (`forgotPasswordRph`).
 * - Returns RFC 7807 ProblemDetail with 429 status and X-RateLimit / Retry-After headers when breached.
 */
@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger LOG = LoggerFactory.getLogger(RateLimitFilter.class);
    private static final String AUTH_PREFIX = "/api/v1/auth";
    private static final String USERS_PREFIX = "/api/v1/users";
    private static final String FORGOT_PASSWORD_PATH = "/api/v1/auth/forgot-password";

    private final PactFlowProperties properties;
    private final ObjectMapper objectMapper;
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            @NonNull final HttpServletRequest request,
            @NonNull final HttpServletResponse response,
            @NonNull final FilterChain filterChain) throws ServletException, IOException {

        final String path = request.getRequestURI();

        if (path == null || (!path.startsWith(AUTH_PREFIX) && !path.startsWith(USERS_PREFIX))) {
            filterChain.doFilter(request, response);
            return;
        }

        final String ip = ClientIpExtractor.from(request);
        final String method = request.getMethod();
        final boolean isAuth = path.startsWith(AUTH_PREFIX);
        final boolean isForgotPassword = FORGOT_PASSWORD_PATH.equals(path);
        final boolean isMutation = !isAuth && ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method)
                || "PATCH".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method));

        final String bucketPrefix;
        if (isForgotPassword) {
            bucketPrefix = "forgot:";
        } else if (isAuth) {
            bucketPrefix = "auth:";
        } else if (isMutation) {
            bucketPrefix = "mutation:";
        } else {
            bucketPrefix = "user_read:";
        }
        final String bucketKey = bucketPrefix + ip;

        final Bucket bucket = cache.computeIfAbsent(bucketKey, key -> createBucket(isForgotPassword, isAuth, isMutation));
        final ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        final long limit;
        if (isForgotPassword) {
            limit = properties.getSecurity().getRateLimit().getForgotPasswordRph();
        } else if (isAuth) {
            limit = properties.getSecurity().getRateLimit().getAuthEndpointsRpm();
        } else if (isMutation) {
            limit = properties.getSecurity().getRateLimit().getMutationEndpointsRpm();
        } else {
            limit = properties.getSecurity().getRateLimit().getGlobalAuthenticatedRpm();
        }

        response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, probe.getRemainingTokens())));

        if (probe.isConsumed()) {
            filterChain.doFilter(request, response);
        } else {
            final long waitForSeconds = Math.max(1, probe.getNanosToWaitForRefill() / 1_000_000_000L);
            LOG.warn("Rate limit breached for IP {} on endpoint {} (retry after {}s)", ip, path, waitForSeconds);

            response.setHeader("Retry-After", String.valueOf(waitForSeconds));
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);

            final ProblemDetail detail = ProblemDetail.forStatusAndDetail(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Rate limit exceeded. Please try again in " + waitForSeconds + " seconds."
            );
            detail.setTitle("TOO_MANY_REQUESTS");
            detail.setType(URI.create("https://pactflow.io/errors/TOO_MANY_REQUESTS"));
            detail.setInstance(URI.create(path));
            detail.setProperty("timestamp", Instant.now().toString());

            objectMapper.writeValue(response.getOutputStream(), detail);
        }
    }

    private Bucket createBucket(final boolean isForgotPassword, final boolean isAuth, final boolean isMutation) {
        if (isForgotPassword) {
            final long rph = properties.getSecurity().getRateLimit().getForgotPasswordRph();
            return Bucket.builder()
                    .addLimit(Bandwidth.builder().capacity(rph).refillGreedy(rph, Duration.ofHours(1)).build())
                    .build();
        } else if (isAuth) {
            final long rpm = properties.getSecurity().getRateLimit().getAuthEndpointsRpm();
            return Bucket.builder()
                    .addLimit(Bandwidth.builder().capacity(rpm).refillGreedy(rpm, Duration.ofMinutes(1)).build())
                    .build();
        } else if (isMutation) {
            final long rpm = properties.getSecurity().getRateLimit().getMutationEndpointsRpm();
            return Bucket.builder()
                    .addLimit(Bandwidth.builder().capacity(rpm).refillGreedy(rpm, Duration.ofMinutes(1)).build())
                    .build();
        } else {
            final long rpm = properties.getSecurity().getRateLimit().getGlobalAuthenticatedRpm();
            return Bucket.builder()
                    .addLimit(Bandwidth.builder().capacity(rpm).refillGreedy(rpm, Duration.ofMinutes(1)).build())
                    .build();
        }
    }
}
