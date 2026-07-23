package com.pactflow.infrastructure.persistence.jpa;

import com.pactflow.infrastructure.persistence.entity.MilestoneJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaMilestoneRepository extends JpaRepository<MilestoneJpaEntity, UUID> {
    List<MilestoneJpaEntity> findByProjectId(UUID projectId);
}
