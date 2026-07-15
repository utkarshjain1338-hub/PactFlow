package com.pactflow.infrastructure.web.security;

import com.pactflow.infrastructure.config.PactFlowProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.net.URI;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;

/**
 * Spring Security 6 configuration for PactFlow API.
 *
 * <p>Security design decisions per:
 * <ul>
 *   <li>SYSTEM_ARCHITECTURE.md §8 (Authentication Architecture)</li>
 *   <li>SECURITY_THREAT_MODEL.md §4 (Authentication Threats)</li>
 *   <li>API_SPECIFICATION.md §1.10 (API Security Best Practices)</li>
 *   <li>PROJECT_CONSTITUTION.md §5 (Security Principles)</li>
 * </ul>
 *
 * <p>Session strategy: STATELESS — JWTs carried in Authorization header.
 * Refresh tokens stored in httpOnly Secure SameSite=Strict cookies.
 *
 * <p>NOTE: The JWT filter ({@code JwtAuthFilter}) is not registered in this foundation
 * milestone. The filter chain stub permits all requests for now.
 * JWT enforcement will be added in the Authentication milestone.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final PactFlowProperties properties;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RateLimitFilter rateLimitFilter;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public SecurityConfig(
            final PactFlowProperties properties,
            final JwtAuthenticationFilter jwtAuthenticationFilter,
            final RateLimitFilter rateLimitFilter,
            final com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.properties = properties;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.rateLimitFilter = rateLimitFilter;
        this.objectMapper = objectMapper;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(final HttpSecurity http) throws Exception {
        http
                // ─── Session Management — Stateless JWT ─────────────────────
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // ─── CSRF — Disabled for REST API ────────────────────────────
                .csrf(AbstractHttpConfigurer::disable)

                // ─── CORS ─────────────────────────────────────────────────────
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // ─── Security Response Headers ────────────────────────────────
                .headers(headers -> headers
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31536000))
                        .frameOptions(frame -> frame.deny())
                        .contentTypeOptions(contentType -> {})
                        .xssProtection(xss -> {})
                        .referrerPolicy(referrer ->
                                referrer.policy(
                                        ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        .permissionsPolicy(permissions ->
                                permissions.policy("geolocation=(), microphone=(), camera=()")))

                // ─── Exception Handling — RFC 7807 ────────────────────────────
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, ex) -> {
                            response.setStatus(HttpStatus.UNAUTHORIZED.value());
                            response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
                            final ProblemDetail detail = ProblemDetail.forStatusAndDetail(
                                    HttpStatus.UNAUTHORIZED, "Authentication required or token invalid/revoked.");
                            detail.setTitle("UNAUTHORIZED");
                            detail.setType(URI.create("https://pactflow.io/errors/UNAUTHORIZED"));
                            detail.setInstance(URI.create(request.getRequestURI()));
                            detail.setProperty("timestamp", Instant.now().toString());
                            objectMapper.writeValue(response.getOutputStream(), detail);
                        })
                        .accessDeniedHandler((request, response, ex) -> {
                            response.setStatus(HttpStatus.FORBIDDEN.value());
                            response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
                            final ProblemDetail detail = ProblemDetail.forStatusAndDetail(
                                    HttpStatus.FORBIDDEN, "You do not have permission to perform this action.");
                            detail.setTitle("FORBIDDEN");
                            detail.setType(URI.create("https://pactflow.io/errors/FORBIDDEN"));
                            detail.setInstance(URI.create(request.getRequestURI()));
                            detail.setProperty("timestamp", Instant.now().toString());
                            objectMapper.writeValue(response.getOutputStream(), detail);
                        }))

                // ─── Authorization Rules ──────────────────────────────────────
                .authorizeHttpRequests(auth -> auth
                        // Public health checks on primary API port (8080) and management port (8081)
                        .requestMatchers(
                                "/api/v1/health/**",
                                "/actuator/health",
                                "/actuator/health/**",
                                "/actuator/info")
                                .permitAll()

                        // Authentication endpoints — public
                        .requestMatchers(HttpMethod.POST,
                                "/api/v1/auth/login",
                                "/api/v1/auth/register",
                                "/api/v1/auth/refresh",
                                "/api/v1/auth/verify-email",
                                "/api/v1/auth/forgot-password",
                                "/api/v1/auth/reset-password")
                                .permitAll()

                        // Wallet challenge — public
                        .requestMatchers(HttpMethod.GET, "/api/v1/wallets/challenge").permitAll()

                        // OpenAPI — permitted
                        .requestMatchers(
                                "/api-docs/**",
                                "/api-docs.yaml",
                                "/swagger-ui/**",
                                "/swagger-ui.html")
                                .permitAll()

                        // All other endpoints require authentication
                        .anyRequest().authenticated())

                // ─── Security Filter Chain Order ─────────────────────────────
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS configuration per API_SPECIFICATION.md §1.10.
     *
     * <p>Only explicitly whitelisted origins are permitted.
     * In production: only https://pactflow.io and https://app.pactflow.io.
     * In development: also http://localhost:3000.
     *
     * @return CORS configuration source
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        final CorsConfiguration config = new CorsConfiguration();

        // Parse comma-separated origins from configuration
        final String[] origins = properties.getSecurity().getCors().getAllowedOrigins().split(",");
        config.setAllowedOrigins(Arrays.asList(origins));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With",
                "Idempotency-Key",
                "X-RateLimit-Limit",
                "X-RateLimit-Remaining"));
        config.setExposedHeaders(List.of(
                "X-RateLimit-Limit",
                "X-RateLimit-Remaining",
                "X-RateLimit-Reset",
                "Retry-After",
                "Deprecation",
                "Sunset"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    /**
     * Argon2id password encoder.
     *
     * <p>Per SECURITY_THREAT_MODEL.md §1.3 and DOMAIN_MODEL.md §9:
     * "Password hashes: Argon2id only. Raw passwords never touch the DB."
     *
     * <p>Parameters tuned for security vs. performance:
     * - saltLength: 16 bytes (128-bit)
     * - hashLength: 32 bytes (256-bit)
     * - parallelism: 2 (tuned per Section 8 security rules)
     * - memory: 65536 KB (64 MB — OWASP recommendation)
     * - iterations: 3 (OWASP minimum)
     *
     * @return Argon2id password encoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new Argon2PasswordEncoder(16, 32, 2, 65536, 3);
    }
}
