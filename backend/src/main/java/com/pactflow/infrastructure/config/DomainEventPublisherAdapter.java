package com.pactflow.infrastructure.config;

import com.pactflow.domain.shared.DomainEvent;
import com.pactflow.domain.shared.DomainEventPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Infrastructure adapter implementing DomainEventPublisher.
 *
 * <p>Authority: SYSTEM_ARCHITECTURE.md §5.4 (Transactional Outbox Pattern).
 * Publishes domain events via Spring's ApplicationEventPublisher so outbox listeners
 * can persist them reliably inside the same transaction.
 */
@Component
public class DomainEventPublisherAdapter implements DomainEventPublisher {

    private static final Logger LOG = LoggerFactory.getLogger(DomainEventPublisherAdapter.class);

    private final ApplicationEventPublisher applicationEventPublisher;

    public DomainEventPublisherAdapter(final ApplicationEventPublisher applicationEventPublisher) {
        this.applicationEventPublisher = applicationEventPublisher;
    }

    @Override
    public void publish(final DomainEvent event) {
        LOG.info("Publishing domain event [eventType={}, eventId={}, aggregateId={}] via outbox",
                event.eventType(), event.eventId(), event.aggregateId());
        applicationEventPublisher.publishEvent(event);
    }
}
