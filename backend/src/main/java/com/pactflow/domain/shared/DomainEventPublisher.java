package com.pactflow.domain.shared;

/**
 * Domain port interface for publishing domain events via the Transactional Outbox Pattern.
 *
 * <p>Authority: SYSTEM_ARCHITECTURE.md §5.4 (Transaction Management & Outbox Pattern),
 * PROJECT_CONSTITUTION.md (Dependency Rule).
 */
public interface DomainEventPublisher {

    /**
     * Publishes a domain event within the current active transaction.
     *
     * @param event domain event to publish
     */
    void publish(DomainEvent event);
}
