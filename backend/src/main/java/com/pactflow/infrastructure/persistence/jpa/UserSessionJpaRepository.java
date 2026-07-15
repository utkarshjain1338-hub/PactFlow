package com.pactflow.infrastructure.persistence.jpa;

import com.pactflow.infrastructure.persistence.entity.UserSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for UserSessionEntity.
 * Authority: DOMAIN_MODEL.md §6 (user_sessions), SYSTEM_ARCHITECTURE.md §8.2.
 */
@Repository
public interface UserSessionJpaRepository extends JpaRepository<UserSessionEntity, UUID> {

    Optional<UserSessionEntity> findByRefreshTokenHash(String refreshTokenHash);

    Optional<UserSessionEntity> findByTokenHash(String tokenHash);

    void deleteByUserId(UUID userId);

    void deleteByRefreshTokenHash(String refreshTokenHash);
}
