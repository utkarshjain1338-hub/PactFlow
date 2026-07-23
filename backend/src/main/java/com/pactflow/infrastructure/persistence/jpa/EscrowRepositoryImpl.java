package com.pactflow.infrastructure.persistence.jpa;

import com.pactflow.domain.escrow.Escrow;
import com.pactflow.domain.escrow.EscrowRepository;
import com.pactflow.domain.escrow.EscrowStatus;
import com.pactflow.infrastructure.persistence.entity.EscrowJpaEntity;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class EscrowRepositoryImpl implements EscrowRepository {

    private final JpaEscrowRepository jpaEscrowRepository;

    public EscrowRepositoryImpl(JpaEscrowRepository jpaEscrowRepository) {
        this.jpaEscrowRepository = jpaEscrowRepository;
    }

    @Override
    public Escrow save(Escrow escrow) {
        EscrowJpaEntity entity = toEntity(escrow);
        EscrowJpaEntity savedEntity = jpaEscrowRepository.save(entity);
        return toDomain(savedEntity);
    }

    @Override
    public Optional<Escrow> findById(UUID id) {
        return jpaEscrowRepository.findById(id).map(this::toDomain);
    }
    
    @Override
    public Optional<Escrow> findByMilestoneId(UUID milestoneId) {
        return jpaEscrowRepository.findByMilestoneId(milestoneId).map(this::toDomain);
    }

    @Override
    public java.util.List<Escrow> findByProjectId(UUID projectId) {
        return jpaEscrowRepository.findByProjectId(projectId).stream()
                .map(this::toDomain)
                .collect(java.util.stream.Collectors.toList());
    }

    private EscrowJpaEntity toEntity(Escrow domain) {
        EscrowJpaEntity entity = new EscrowJpaEntity();
        entity.setId(domain.getId());
        if (domain.getVersion() != null) {
            entity.setVersion(domain.getVersion());
        }
        entity.setProjectId(domain.getProjectId());
        entity.setMilestoneId(domain.getMilestoneId());
        entity.setContractId(domain.getContractId());
        entity.setStatus(domain.getStatus().name());
        entity.setFundedAmount(domain.getFundedAmount());
        entity.setFundedAt(domain.getFundedAt());
        entity.setReleasedAt(domain.getReleasedAt());
        entity.setRefundedAt(domain.getRefundedAt());
        entity.setTransactionReferences(domain.getTransactionReferences());
        
        return entity;
    }

    private Escrow toDomain(EscrowJpaEntity entity) {
        return Escrow.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .projectId(entity.getProjectId())
                .milestoneId(entity.getMilestoneId())
                .contractId(entity.getContractId())
                .status(EscrowStatus.valueOf(entity.getStatus()))
                .fundedAmount(entity.getFundedAmount())
                .fundedAt(entity.getFundedAt())
                .releasedAt(entity.getReleasedAt())
                .refundedAt(entity.getRefundedAt())
                .transactionReferences(entity.getTransactionReferences())
                .build();
    }
}
