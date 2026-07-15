package com.pactflow.domain.user.event;

import com.pactflow.domain.shared.DomainEvent;
import com.pactflow.domain.user.User;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Domain event published when a user's profile fields are updated.
 *
 * <p>Authority: DOMAIN_MODEL.md §3 (Identity Domain Events), API_SPECIFICATION.md Domain 2.
 */
public record UserProfileUpdatedEvent(
        UUID eventId,
        UUID aggregateId,
        Instant occurredAt
) implements DomainEvent {

    /**
     * Canonical constructor enforcing non-null invariants.
     *
     * @param eventId     unique ID of this event
     * @param aggregateId ID of the updated user
     * @param occurredAt  timestamp when event occurred
     */
    public UserProfileUpdatedEvent {
        Objects.requireNonNull(eventId, "eventId must not be null");
        Objects.requireNonNull(aggregateId, "aggregateId must not be null");
        Objects.requireNonNull(occurredAt, "occurredAt must not be null");
    }

    /**
     * Factory method creating a UserProfileUpdatedEvent from an updated User aggregate.
     *
     * @param user the user aggregate
     * @return initialized UserProfileUpdatedEvent
     */
    public static UserProfileUpdatedEvent of(final User user) {
        return new UserProfileUpdatedEvent(
                UUID.randomUUID(),
                user.getId(),
                Instant.now()
        );
    }

    @Override
    public String eventType() {
        return "UserProfileUpdated";
    }

    @Override
    public String sourceContext() {
        return "Identity";
    }

    @Override
    public String aggregateType() {
        return "User";
    }
}
