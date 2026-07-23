package com.pactflow.infrastructure.persistence.jpa;

import com.pactflow.infrastructure.persistence.entity.DeliverableJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaDeliverableRepository extends JpaRepository<DeliverableJpaEntity, UUID> {
    List<DeliverableJpaEntity> findByMilestoneId(UUID milestoneId);
}
