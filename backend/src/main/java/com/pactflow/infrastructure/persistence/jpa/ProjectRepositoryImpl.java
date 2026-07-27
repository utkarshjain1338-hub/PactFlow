package com.pactflow.infrastructure.persistence.jpa;

import com.pactflow.domain.milestone.Milestone;
import com.pactflow.domain.milestone.MilestoneStatus;
import com.pactflow.domain.project.Project;
import com.pactflow.domain.project.ProjectRepository;
import com.pactflow.domain.project.ProjectStatus;
import com.pactflow.infrastructure.persistence.entity.MilestoneJpaEntity;
import com.pactflow.infrastructure.persistence.entity.ProjectJpaEntity;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class ProjectRepositoryImpl implements ProjectRepository {

    private final JpaProjectRepository jpaProjectRepository;

    public ProjectRepositoryImpl(JpaProjectRepository jpaProjectRepository) {
        this.jpaProjectRepository = jpaProjectRepository;
    }

    @Override
    public Project save(Project project) {
        ProjectJpaEntity entity = jpaProjectRepository.findById(project.getId()).orElseGet(ProjectJpaEntity::new);
        updateEntity(entity, project);
        ProjectJpaEntity savedEntity = jpaProjectRepository.save(entity);
        return toDomain(savedEntity);
    }

    @Override
    public Optional<Project> findById(UUID id) {
        return jpaProjectRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Project> findByClientUserId(UUID clientUserId) {
        return jpaProjectRepository.findByClientUserId(clientUserId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Project> findByFreelancerUserId(UUID freelancerUserId) {
        return jpaProjectRepository.findByFreelancerUserId(freelancerUserId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    private void updateEntity(ProjectJpaEntity entity, Project domain) {
        entity.setId(domain.getId());
        entity.setClientUserId(domain.getClientUserId());
        entity.setClientWalletId(domain.getClientWalletId());
        entity.setFreelancerUserId(domain.getFreelancerUserId());
        entity.setFreelancerWalletId(domain.getFreelancerWalletId());
        entity.setTitle(domain.getTitle());
        entity.setDescription(domain.getDescription());
        entity.setStatus(domain.getStatus().name());
        entity.setTotalBudgetXlm(domain.getTotalBudgetXlm());
        entity.setAssetCode(domain.getAssetCode());
        entity.setDeadline(domain.getDeadline());
        entity.setDeleted(domain.isDeleted());

        List<MilestoneJpaEntity> newMilestones = domain.getMilestones().stream().map(m -> {
            MilestoneJpaEntity mEntity = null;
            if (entity.getMilestones() != null) {
                mEntity = entity.getMilestones().stream()
                        .filter(e -> e.getId().equals(m.getId()))
                        .findFirst()
                        .orElse(null);
            }
            if (mEntity == null) {
                mEntity = new MilestoneJpaEntity();
                mEntity.setId(m.getId());
            }
            mEntity.setProjectId(m.getProjectId());
            mEntity.setTitle(m.getTitle());
            mEntity.setDescription(m.getDescription());
            mEntity.setAmountXlm(m.getAmountXlm());
            mEntity.setAssetCode(m.getAssetCode());
            mEntity.setStatus(m.getStatus().name());
            mEntity.setSequenceOrder(m.getSequenceOrder());
            mEntity.setDueDate(m.getDueDate());
            mEntity.setStrictDeadline(m.isStrictDeadline());
            mEntity.setDeleted(m.isDeleted());
            return mEntity;
        }).collect(Collectors.toList());

        if (entity.getMilestones() == null) {
            entity.setMilestones(new java.util.ArrayList<>());
        }
        entity.getMilestones().clear();
        entity.getMilestones().addAll(newMilestones);
    }

    private Project toDomain(ProjectJpaEntity entity) {
        List<Milestone> milestones = entity.getMilestones().stream().map(mEntity -> 
            Milestone.builder()
                .id(mEntity.getId())
                .projectId(mEntity.getProjectId())
                .title(mEntity.getTitle())
                .description(mEntity.getDescription())
                .amountXlm(mEntity.getAmountXlm())
                .assetCode(mEntity.getAssetCode())
                .status(MilestoneStatus.valueOf(mEntity.getStatus()))
                .sequenceOrder(mEntity.getSequenceOrder())
                .dueDate(mEntity.getDueDate())
                .isStrictDeadline(mEntity.isStrictDeadline())
                .isDeleted(mEntity.isDeleted())
                .build()
        ).collect(Collectors.toList());

        return Project.builder()
                .id(entity.getId())
                .clientUserId(entity.getClientUserId())
                .clientWalletId(entity.getClientWalletId())
                .freelancerUserId(entity.getFreelancerUserId())
                .freelancerWalletId(entity.getFreelancerWalletId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .status(ProjectStatus.valueOf(entity.getStatus()))
                .totalBudgetXlm(entity.getTotalBudgetXlm())
                .assetCode(entity.getAssetCode())
                .deadline(entity.getDeadline())
                .isDeleted(entity.isDeleted())
                .milestones(milestones)
                .build();
    }
}
