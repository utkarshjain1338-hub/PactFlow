package com.pactflow.infrastructure.persistence.jpa;

import com.pactflow.domain.deliverable.Deliverable;
import com.pactflow.domain.deliverable.DeliverableRepository;
import com.pactflow.domain.deliverable.DeliverableStatus;
import com.pactflow.infrastructure.persistence.entity.DeliverableJpaEntity;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class DeliverableRepositoryImpl implements DeliverableRepository {

    private final JpaDeliverableRepository jpaRepository;

    public DeliverableRepositoryImpl(JpaDeliverableRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Deliverable save(Deliverable deliverable) {
        DeliverableJpaEntity entity = toEntity(deliverable);
        DeliverableJpaEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Deliverable> findById(UUID id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Deliverable> findByMilestoneId(UUID milestoneId) {
        return jpaRepository.findByMilestoneId(milestoneId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    private DeliverableJpaEntity toEntity(Deliverable domain) {
        DeliverableJpaEntity entity = new DeliverableJpaEntity();
        entity.setId(domain.getId());
        entity.setMilestoneId(domain.getMilestoneId());
        entity.setSubmittedBy(domain.getSubmittedBy());
        entity.setTitle(domain.getTitle());
        entity.setDescription(domain.getDescription());
        entity.setFileUrl(domain.getFileUrl());
        entity.setRepositoryUrl(domain.getRepositoryUrl());
        entity.setCommitHash(domain.getCommitHash());
        entity.setStatus(domain.getStatus().name());
        entity.setSubmittedAt(domain.getSubmittedAt());
        return entity;
    }

    private Deliverable toDomain(DeliverableJpaEntity entity) {
        return Deliverable.builder()
                .id(entity.getId())
                .milestoneId(entity.getMilestoneId())
                .submittedBy(entity.getSubmittedBy())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .fileUrl(entity.getFileUrl())
                .repositoryUrl(entity.getRepositoryUrl())
                .commitHash(entity.getCommitHash())
                .status(DeliverableStatus.valueOf(entity.getStatus()))
                .submittedAt(entity.getSubmittedAt())
                .build();
    }
}
