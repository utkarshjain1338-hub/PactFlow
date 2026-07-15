package com.pactflow.domain.user;

import com.pactflow.domain.shared.DomainEvent;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Domain event published when a new user registers on PactFlow.
 *
 * <p>Authority: DOMAIN_MODEL.md §3 (Identity Domain Events), SYSTEM_ARCHITECTURE.md §11.2.
 */
public record UserRegisteredEvent(
        UUID eventId,
        UUID aggregateId,
        String email,
        AccountType accountType,
        Instant occurredAt
) implements DomainEvent {

    /**
     * Compact canonical constructor enforcing non-null invariants.
     *
     * @param eventId     unique ID of this event
     * @param aggregateId ID of the newly registered user
     * @param email       user email address
     * @param accountType account type of the user
     * @param occurredAt  timestamp when event occurred
     */
    public UserRegisteredEvent {
        Objects.requireNonNull(eventId, "eventId must not be null");
        Objects.requireNonNull(aggregateId, "aggregateId must not be null");
        Objects.requireNonNull(email, "email must not be null");
        Objects.requireNonNull(accountType, "accountType must not be null");
        Objects.requireNonNull(occurredAt, "occurredAt must not be null");
    }

    /**
     * Factory method creating a UserRegisteredEvent from a newly registered User aggregate.
     *
     * @param user the user aggregate
     * @return initialized UserRegisteredEvent
     */
    public static UserRegisteredEvent of(final User user) {
        return new UserRegisteredEvent(
                UUID.randomUUID(),
                user.getId(),
                user.getEmail().getValue(),
                user.getAccountType(),
                Instant.now()
        );
    }

    @Override
    public String eventType() {
        return "UserRegistered";
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
