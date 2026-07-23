package com.pactflow.domain.shared;

import java.time.OffsetDateTime;

import java.time.Instant;
import java.util.UUID;

public interface DomainEvent {
    UUID eventId();
    UUID aggregateId();
    Instant occurredAt();
    String eventType();
    String sourceContext();
    String aggregateType();
}
