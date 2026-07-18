package com.pactflow.infrastructure.persistence.jpa;

import com.pactflow.infrastructure.persistence.entity.UserJpaEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for UserJpaEntity.
 * Authority: DOMAIN_MODEL.md §6, PROJECT_CONSTITUTION.md §7.
 */
@Repository
public interface UserJpaRepository extends JpaRepository<UserJpaEntity, UUID> {

    Optional<UserJpaEntity> findByIdAndIsDeletedFalse(UUID id);

    Optional<UserJpaEntity> findByEmailIgnoreCaseAndIsDeletedFalse(String email);

    boolean existsByEmailIgnoreCaseAndIsDeletedFalse(String email);

    @Query("SELECT u FROM UserJpaEntity u WHERE u.isDeleted = true "
            + "AND (u.email IS NOT NULL OR u.displayName IS NOT NULL OR u.avatarUrl IS NOT NULL "
            + "OR u.bio IS NOT NULL OR u.passwordHash IS NOT NULL) ORDER BY u.deletedAt ASC")
    List<UserJpaEntity> findSoftDeletedPendingAnonymization(Pageable pageable);

    @Modifying
    @Query(value = "SELECT anonymize_user(:userId)", nativeQuery = true)
    void anonymizeUser(@Param("userId") UUID userId);
}
