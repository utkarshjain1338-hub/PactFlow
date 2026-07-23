package com.pactflow.domain.escrow;

import java.util.Optional;
import java.util.UUID;

public interface EscrowRepository {
    Escrow save(Escrow escrow);
    Optional<Escrow> findById(UUID id);
    Optional<Escrow> findByMilestoneId(UUID milestoneId);
    java.util.List<Escrow> findByProjectId(UUID projectId);
}
