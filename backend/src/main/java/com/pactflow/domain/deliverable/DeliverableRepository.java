package com.pactflow.domain.deliverable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeliverableRepository {
    Deliverable save(Deliverable deliverable);
    Optional<Deliverable> findById(UUID id);
    List<Deliverable> findByMilestoneId(UUID milestoneId);
}
