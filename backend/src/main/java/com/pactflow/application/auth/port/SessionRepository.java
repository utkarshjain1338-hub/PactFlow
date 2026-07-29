package com.pactflow.application.auth.port;

import com.pactflow.infrastructure.persistence.entity.UserSessionEntity;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface SessionRepository {
    UserSessionEntity createSession(
            UUID userId, String accessToken, String refreshToken, 
            String ipAddress, String userAgent, Instant expiresAt);
    Optional<UserSessionEntity> findByRefreshToken(String refreshToken);
    void invalidateSessionByRefreshToken(String refreshToken);
    void invalidateAllSessionsForUser(UUID userId);
    UserSessionEntity rotateSession(
            UserSessionEntity session, String accessToken, String rawRefreshToken, Instant expiresAt);
    boolean isSessionActive(UUID sessionId);
}
