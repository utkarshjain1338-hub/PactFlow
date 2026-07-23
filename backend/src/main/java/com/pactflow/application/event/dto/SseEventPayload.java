package com.pactflow.application.event.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class SseEventPayload {
    private String eventId;
    private Instant timestamp;
    private String entityId;
    private String type;
    private Object payload;
}
