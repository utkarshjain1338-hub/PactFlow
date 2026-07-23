package com.pactflow.domain.milestone;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MilestoneRepository {
    Milestone save(Milestone milestone);
    Optional<Milestone> findById(UUID id);
    List<Milestone> findByProjectId(UUID projectId);
}
