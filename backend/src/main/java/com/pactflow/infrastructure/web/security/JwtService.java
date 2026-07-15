package com.pactflow.infrastructure.web.security;

import com.pactflow.domain.user.User;
import com.pactflow.infrastructure.config.PactFlowProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Date;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

/**
 * Security infrastructure service responsible for JWT access token and opaque refresh token lifecycle.
 *
 * <p>Authority: SYSTEM_ARCHITECTURE.md §8.2 (JWT Specification), ADR-004 (HS256 Signing Strategy).
 * Access tokens: 15-minute TTL signed with HMAC-SHA256 (HS256).
 * Refresh tokens: Opaque 256-bit SecureRandom hex tokens.
 */
@Service
@RequiredArgsConstructor
public class JwtService {

    private static final Logger LOG = LoggerFactory.getLogger(JwtService.class);
    private final PactFlowProperties properties;
    private final SecureRandom secureRandom = new SecureRandom();
    private SecretKey secretKey;

    /**
     * Initializes the HMAC secret key from application properties and verifies key length >= 256 bits.
     */
    @PostConstruct
    public void init() {
        final byte[] keyBytes = properties.getSecurity().getJwt().getSecretKey().getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT secret key must be at least 256 bits (32 bytes) per AT-04 / ADR-004.");
        }
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generates a stateless JWT access token for an authenticated user session.
     *
     * @param user      authenticated user aggregate
     * @param sessionId session UUID from user_sessions
     * @return signed JWT string
     */
    public String generateAccessToken(final User user, final UUID sessionId) {
        final Instant now = Instant.now();
        final Instant expiry = now.plus(properties.getSecurity().getJwt().getAccessTokenTtl());

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail().getValue())
                .claim("accountType", user.getAccountType().name())
                .claim("sessionId", sessionId.toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Generates an opaque, cryptographically secure 256-bit (32-byte) refresh token.
     *
     * @return 64-character lowercase hex string
     */
    public String generateRefreshToken() {
        final byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return HexFormat.of().formatHex(randomBytes);
    }

    /**
     * Parses and validates a JWT access token signature and expiration.
     *
     * @param token Bearer JWT token string
     * @return optional containing parsed Claims if valid and unexpired
     */
    public Optional<Claims> parseAndValidateClaims(final String token) {
        try {
            final Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .clockSkewSeconds(60)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Optional.of(claims);
        } catch (final JwtException | IllegalArgumentException e) {
            LOG.debug("JWT verification failed: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
