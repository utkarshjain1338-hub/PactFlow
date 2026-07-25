package com.pactflow.infrastructure.persistence;

import com.pactflow.infrastructure.persistence.entity.UserSessionEntity;
import com.pactflow.infrastructure.persistence.jpa.UserJpaRepository;
import com.pactflow.infrastructure.persistence.jpa.UserSessionJpaRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;
import com.pactflow.application.auth.port.SessionRepository;

/**
 * Infrastructure repository managing user session persistence in PostgreSQL
 * with active session liveness caching and eviction in Redis.
 *
 * <p>Authority: SYSTEM_ARCHITECTURE.md §8.2, §8.3 (Redis Session Cache & Opaque Refresh Tokens).
 *
 * <p>Access and refresh tokens are never persisted in plaintext server-side.
 * Only SHA-256 hashes are stored in PostgreSQL user_sessions.
 * Session liveness is mirrored in Redis (`auth:session:{sessionId}`) for fast filter verification.
 */
@Component
@RequiredArgsConstructor
public class UserSessionRepositoryImpl implements SessionRepository {

    private static final Logger LOG = LoggerFactory.getLogger(UserSessionRepositoryImpl.class);
    private static final String SESSION_KEY_PREFIX = "auth:session:";

    private final UserSessionJpaRepository sessionJpaRepository;
    private final UserJpaRepository userJpaRepository;
    private final StringRedisTemplate redisTemplate;

    /**
     * Computes the SHA-256 hex digest of a token string.
     *
     * @param token raw token
     * @return 64-character lowercase hex string
     */
    public String sha256(final String token) {
        try {
            final MessageDigest digest = MessageDigest.getInstance("SHA-256");
            final byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (final NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm unavailable in JVM", e);
        }
    }

    /**
     * Creates and stores a new user session with SHA-256 hashed tokens and Redis liveness caching.
     *
     * @param userId       user UUID
     * @param accessToken  raw JWT access token
     * @param refreshToken raw opaque refresh token
     * @param ipAddress    client IP address
     * @param userAgent    client User-Agent string
     * @param expiresAt    session expiration timestamp
     * @return persisted UserSessionEntity
     */
    @Transactional
    public UserSessionEntity createSession(
            final UUID userId,
            final String accessToken,
            final String refreshToken,
            final String ipAddress,
            final String userAgent,
            final Instant expiresAt) {

        final UUID sessionId = UUID.randomUUID();
        final String tokenHash = sha256(accessToken);
        final String refreshHash = sha256(refreshToken);

        final UserSessionEntity entity = UserSessionEntity.builder()
                .id(sessionId)
                .userId(userId)
                .user(userJpaRepository.getReferenceById(userId))
                .tokenHash(tokenHash)
                .refreshTokenHash(refreshHash)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .expiresAt(expiresAt)
                .createdAt(Instant.now())
                .build();

        final UserSessionEntity saved = sessionJpaRepository.save(entity);
        cacheSessionLiveness(sessionId, expiresAt);
        return saved;
    }

    /**
     * Fast session liveness verification called on every request by JwtAuthenticationFilter.
     *
     * <p>Authority: SYSTEM_ARCHITECTURE.md §8.3 (Session Liveness Check via Redis).
     *
     * @param sessionId session UUID extracted from JWT `sessionId` claim
     * @return true if session is active and unexpired
     */
    public boolean isSessionActive(final UUID sessionId) {
        if (sessionId == null) {
            return false;
        }
        final String redisKey = SESSION_KEY_PREFIX + sessionId;
        try {
            final String cachedStatus = redisTemplate.opsForValue().get(redisKey);
            if ("ACTIVE".equals(cachedStatus)) {
                return true;
            }
        } catch (final Exception e) {
            LOG.warn("Redis session lookup failed for session {}. Falling back to PostgreSQL check: {}",
                    sessionId, e.getMessage());
        }

        // Fallback or cache miss check against database
        final Optional<UserSessionEntity> optEntity = sessionJpaRepository.findById(sessionId);
        if (optEntity.isPresent()) {
            final UserSessionEntity session = optEntity.get();
            if (session.getExpiresAt().isAfter(Instant.now())) {
                cacheSessionLiveness(sessionId, session.getExpiresAt());
                return true;
            } else {
                sessionJpaRepository.deleteById(sessionId);
            }
        }
        return false;
    }

    /**
     * Looks up a session by SHA-256 hashing the raw refresh token.
     *
     * @param rawRefreshToken unhashed refresh token string
     * @return optional containing the matching user session if found
     */
    public Optional<UserSessionEntity> findByRefreshToken(final String rawRefreshToken) {
        final String refreshHash = sha256(rawRefreshToken);
        return sessionJpaRepository.findByRefreshTokenHash(refreshHash);
    }

    /**
     * Rotates an existing session by generating new token hashes and resetting the expiration.
     *
     * @param oldSession      the current session entity
     * @param newAccessToken  new raw access token
     * @param newRefreshToken new raw refresh token
     * @param newExpiresAt    new session expiration timestamp
     * @return updated UserSessionEntity
     */
    @Transactional
    public UserSessionEntity rotateSession(
            final UserSessionEntity oldSession,
            final String newAccessToken,
            final String newRefreshToken,
            final Instant newExpiresAt) {

        // Invalidate old hash / session
        evictSessionCache(oldSession.getId());

        oldSession.setTokenHash(sha256(newAccessToken));
        oldSession.setRefreshTokenHash(sha256(newRefreshToken));
        oldSession.setExpiresAt(newExpiresAt);

        final UserSessionEntity updated = sessionJpaRepository.save(oldSession);
        cacheSessionLiveness(updated.getId(), newExpiresAt);
        return updated;
    }

    /**
     * Invalidates a session by refresh token (used during logout or token replay detection).
     *
     * @param rawRefreshToken raw refresh token string
     */
    @Transactional
    public void invalidateSessionByRefreshToken(final String rawRefreshToken) {
        final String refreshHash = sha256(rawRefreshToken);
        sessionJpaRepository.findByRefreshTokenHash(refreshHash).ifPresent(session -> {
            evictSessionCache(session.getId());
            sessionJpaRepository.delete(session);
        });
    }

    /**
     * Invalidates all sessions across devices for a given user (used upon password reset).
     *
     * @param userId user UUID whose sessions must be revoked
     */
    @Transactional
    public void invalidateAllSessionsForUser(final UUID userId) {
        sessionJpaRepository.deleteByUserId(userId);
    }

    private void cacheSessionLiveness(final UUID sessionId, final Instant expiresAt) {
        try {
            final Duration ttl = Duration.between(Instant.now(), expiresAt);
            if (!ttl.isNegative() && !ttl.isZero()) {
                redisTemplate.opsForValue().set(SESSION_KEY_PREFIX + sessionId, "ACTIVE", ttl);
            }
        } catch (final Exception e) {
            LOG.warn("Failed to update Redis session cache for session {}: {}", sessionId, e.getMessage());
        }
    }

    private void evictSessionCache(final UUID sessionId) {
        try {
            redisTemplate.delete(SESSION_KEY_PREFIX + sessionId);
        } catch (final Exception e) {
            LOG.warn("Failed to evict Redis session cache for session {}: {}", sessionId, e.getMessage());
        }
    }
}
