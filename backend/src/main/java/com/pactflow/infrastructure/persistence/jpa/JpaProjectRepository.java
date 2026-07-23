package com.pactflow.infrastructure.persistence.jpa;

import com.pactflow.infrastructure.persistence.entity.ProjectJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaProjectRepository extends JpaRepository<ProjectJpaEntity, UUID> {
    List<ProjectJpaEntity> findByClientUserId(UUID clientUserId);
    List<ProjectJpaEntity> findByFreelancerUserId(UUID freelancerUserId);
}
