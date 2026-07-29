package com.pactflow.infrastructure.persistence.jpa;

import com.pactflow.domain.milestone.Milestone;
import com.pactflow.domain.milestone.MilestoneRepository;
import com.pactflow.domain.milestone.MilestoneStatus;
import com.pactflow.infrastructure.persistence.entity.MilestoneJpaEntity;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class MilestoneRepositoryImpl implements MilestoneRepository {

    private final JpaMilestoneRepository jpaMilestoneRepository;

    public MilestoneRepositoryImpl(JpaMilestoneRepository jpaMilestoneRepository) {
        this.jpaMilestoneRepository = jpaMilestoneRepository;
    }

    @Override
    public Milestone save(Milestone milestone) {
        MilestoneJpaEntity entity = jpaMilestoneRepository.findById(milestone.getId())
                .orElseGet(MilestoneJpaEntity::new);
        updateEntity(entity, milestone);
        MilestoneJpaEntity savedEntity = jpaMilestoneRepository.save(entity);
        return toDomain(savedEntity);
    }

    @Override
    public Optional<Milestone> findById(UUID id) {
        return jpaMilestoneRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Milestone> findByProjectId(UUID projectId) {
        return jpaMilestoneRepository.findByProjectId(projectId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    private void updateEntity(MilestoneJpaEntity entity, Milestone domain) {
        entity.setId(domain.getId());
        entity.setProjectId(domain.getProjectId());
        entity.setTitle(domain.getTitle());
        entity.setDescription(domain.getDescription());
        entity.setAmountXlm(domain.getAmountXlm());
        entity.setAssetCode(domain.getAssetCode());
        entity.setStatus(domain.getStatus().name());
        entity.setSequenceOrder(domain.getSequenceOrder());
        entity.setDueDate(domain.getDueDate());
        entity.setStrictDeadline(domain.isStrictDeadline());
        entity.setDeleted(domain.isDeleted());
    }

    private Milestone toDomain(MilestoneJpaEntity entity) {
        return Milestone.builder()
                .id(entity.getId())
                .projectId(entity.getProjectId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .amountXlm(entity.getAmountXlm())
                .assetCode(entity.getAssetCode())
                .status(MilestoneStatus.valueOf(entity.getStatus()))
                .sequenceOrder(entity.getSequenceOrder())
                .dueDate(entity.getDueDate())
                .isStrictDeadline(entity.isStrictDeadline())
                .isDeleted(entity.isDeleted())
                .build();
    }
}
