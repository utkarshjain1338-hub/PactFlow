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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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

    /**
     * Constructs the security configuration with injected properties.
     *
     * @param properties PactFlow application properties
     */
    public SecurityConfig(final PactFlowProperties properties) {
        this.properties = properties;
    }

    /**
     * Primary security filter chain.
     *
     * <p>Configures:
     * <ul>
     *   <li>STATELESS session management (JWT-based)</li>
     *   <li>CSRF disabled (API is stateless — no session cookies for state)</li>
     *   <li>CORS from {@link #corsConfigurationSource()}</li>
     *   <li>Security response headers per SECURITY_THREAT_MODEL.md §9</li>
     *   <li>Public paths (actuator health, OpenAPI, auth endpoints)</li>
     *   <li>All other paths require authentication</li>
     * </ul>
     *
     * @param http the Spring Security HTTP builder
     * @return configured SecurityFilterChain
     * @throws Exception on configuration error
     */
    @Bean
    public SecurityFilterChain securityFilterChain(final HttpSecurity http) throws Exception {
        http
                // ─── Session Management — Stateless JWT ─────────────────────
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // ─── CSRF — Disabled for REST API ────────────────────────────
                // SECURITY NOTE: Safe because we are STATELESS (no session cookies carrying auth state).
                // SameSite=Strict on refresh token cookie provides equivalent protection.
                .csrf(AbstractHttpConfigurer::disable)

                // ─── CORS ─────────────────────────────────────────────────────
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // ─── Security Response Headers ────────────────────────────────
                // Per API_SPECIFICATION.md §1.10 and SECURITY_THREAT_MODEL.md §9
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

                // ─── Authorization Rules ──────────────────────────────────────
                .authorizeHttpRequests(auth -> auth
                        // Actuator health probes — public for Railway health checks
                        // SYSTEM_ARCHITECTURE.md §12.3: /actuator/health/liveness + readiness
                        .requestMatchers(
                                "/actuator/health",
                                "/actuator/health/liveness",
                                "/actuator/health/readiness",
                                "/actuator/info")
                                .permitAll()

                        // Authentication endpoints — public
                        // API_SPECIFICATION.md §1.6: Auth flow
                        .requestMatchers(HttpMethod.POST,
                                "/api/v1/auth/login",
                                "/api/v1/auth/register",
                                "/api/v1/auth/refresh")
                                .permitAll()

                        // Wallet challenge — public (but rate-limited)
                        // SYSTEM_ARCHITECTURE.md §8.5: wallet challenge flow
                        .requestMatchers(HttpMethod.GET, "/api/v1/wallets/challenge").permitAll()

                        // OpenAPI — permitted (disabled in prod via springdoc properties)
                        .requestMatchers(
                                "/api-docs/**",
                                "/api-docs.yaml",
                                "/swagger-ui/**",
                                "/swagger-ui.html")
                                .permitAll()

                        // All other endpoints require authentication
                        // NOTE: JWT enforcement added in Authentication milestone
                        .anyRequest().authenticated());

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
     * - parallelism: 1 (single-threaded for Railway single-core instances)
     * - memory: 65536 KB (64 MB — OWASP recommendation)
     * - iterations: 3 (OWASP minimum)
     *
     * @return Argon2id password encoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new Argon2PasswordEncoder(16, 32, 1, 65536, 3);
    }
}
