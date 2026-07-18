package com.pactflow.infrastructure.web.security;

import com.pactflow.infrastructure.config.PactFlowProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.net.URI;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;

/**
 * Spring Security 6 configuration for PactFlow API.
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
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(AbstractHttpConfigurer::disable)
                .cors(c -> c.configurationSource(corsConfigurationSource()))
                .headers(h -> h
                        .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000))
                        .frameOptions(frame -> frame.deny())
                        .contentTypeOptions(contentType -> {})
                        .xssProtection(xss -> {})
                        .referrerPolicy(referrer -> referrer.policy(
                                ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        .permissionsPolicy(p -> p.policy("geolocation=(), microphone=(), camera=()")))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint((req, res, ex) -> writeProblemDetail(res, req,
                                HttpStatus.UNAUTHORIZED, "UNAUTHORIZED",
                                "Authentication required or token invalid/revoked."))
                        .accessDeniedHandler((req, res, ex) -> writeProblemDetail(res, req,
                                HttpStatus.FORBIDDEN, "FORBIDDEN",
                                "You do not have permission to perform this action.")))
                .authorizeHttpRequests(a -> a
                        .requestMatchers("/api/v1/health/**", "/actuator/health",
                                "/actuator/health/**", "/actuator/info").permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/refresh",
                                "/api/v1/auth/verify-email", "/api/v1/auth/forgot-password",
                                "/api/v1/auth/reset-password").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/wallets/challenge").permitAll()
                        .requestMatchers("/api-docs/**", "/api-docs.yaml",
                                "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        final CorsConfiguration config = new CorsConfiguration();
        final String[] origins = properties.getSecurity().getCors().getAllowedOrigins().split(",");
        config.setAllowedOrigins(Arrays.asList(origins));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With",
                "Idempotency-Key", "X-RateLimit-Limit", "X-RateLimit-Remaining"));
        config.setExposedHeaders(List.of("X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset",
                "Retry-After", "Deprecation", "Sunset"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new Argon2PasswordEncoder(16, 32, 2, 65536, 3);
    }

    private void writeProblemDetail(
            final jakarta.servlet.http.HttpServletResponse res, final jakarta.servlet.http.HttpServletRequest req,
            final HttpStatus status, final String title, final String detailMsg) throws java.io.IOException {
        res.setStatus(status.value());
        res.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        final ProblemDetail detail = ProblemDetail.forStatusAndDetail(status, detailMsg);
        detail.setTitle(title);
        detail.setType(URI.create("https://pactflow.io/errors/" + title));
        detail.setInstance(URI.create(req.getRequestURI()));
        detail.setProperty("timestamp", Instant.now().toString());
        objectMapper.writeValue(res.getOutputStream(), detail);
    }
}
