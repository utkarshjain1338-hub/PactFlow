package com.pactflow.infrastructure.persistence.jpa;

import com.pactflow.infrastructure.persistence.entity.EscrowJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaEscrowRepository extends JpaRepository<EscrowJpaEntity, UUID> {
    Optional<EscrowJpaEntity> findByMilestoneId(UUID milestoneId);
    java.util.List<EscrowJpaEntity> findByProjectId(UUID projectId);
}
