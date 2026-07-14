package com.pactflow.domain.shared;

import java.time.Instant;
import java.util.UUID;

/**
 * Base interface for all domain events in PactFlow.
 *
 * <p>Domain events represent significant occurrences within a bounded context.
 * They are published via the Transactional Outbox Pattern and consumed by
 * cross-context handlers.
 *
 * <p>Per SYSTEM_ARCHITECTURE.md §11.2 — Domain Event Catalog and
 * PROJECT_CONSTITUTION.md Rule 6 (modules must be independently testable).
 *
 * <p>IMPORTANT: This interface has ZERO framework dependencies by design.
 * Per PROJECT_CONSTITUTION.md (Dependency Rule): the domain layer
 * imports nothing outside java.* standard library.
 */
public interface DomainEvent {

    /**
     * Unique identifier for this specific event instance.
     *
     * @return UUID v7 event identifier
     */
    UUID eventId();

    /**
     * The type identifier for this event, used for routing and deserialization.
     *
     * @return fully-qualified event type string
     */
    String eventType();

    /**
     * The bounded context that produced this event.
     *
     * @return source context name
     */
    String sourceContext();

    /**
     * The ID of the aggregate root that produced this event.
     *
     * @return aggregate root UUID
     */
    UUID aggregateId();

    /**
     * The type of the aggregate root that produced this event.
     *
     * @return aggregate type name
     */
    String aggregateType();

    /**
     * The timestamp at which the event occurred (wall-clock time).
     *
     * @return UTC instant of event occurrence
     */
    Instant occurredAt();
}
