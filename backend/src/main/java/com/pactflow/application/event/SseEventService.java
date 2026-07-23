package com.pactflow.application.event;

import com.pactflow.application.event.dto.SseEventPayload;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class SseEventService {

    // Map of UserId -> List of their active SseEmitters
    private final Map<UUID, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    @org.springframework.context.event.EventListener
    public void handleSseEvent(SseEventPayload payload) {
        broadcast(payload);
    }

    public SseEmitter subscribe(UUID userId, String lastEventId) {
        // Create an emitter with a longer timeout (e.g., 30 minutes)
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        emitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError((e) -> removeEmitter(userId, emitter));

        // Send an initial connection event
        try {
            emitter.send(SseEmitter.event()
                    .name("connection")
                    .data("connected"));
        } catch (IOException e) {
            removeEmitter(userId, emitter);
        }

        return emitter;
    }

    public void emitToUser(UUID userId, SseEventPayload payload) {
        List<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters == null || userEmitters.isEmpty()) {
            return;
        }

        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();
        
        for (SseEmitter emitter : userEmitters) {
            try {
                emitter.send(SseEmitter.event()
                        .id(payload.getEventId())
                        .name(payload.getType())
                        .data(payload));
            } catch (IOException e) {
                log.warn("Failed to send SSE to user {}, removing emitter", userId);
                deadEmitters.add(emitter);
            }
        }
        
        userEmitters.removeAll(deadEmitters);
    }
    
    public void broadcast(SseEventPayload payload) {
        emitters.forEach((userId, userEmitters) -> emitToUser(userId, payload));
    }

    private void removeEmitter(UUID userId, SseEmitter emitter) {
        List<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters != null) {
            userEmitters.remove(emitter);
            if (userEmitters.isEmpty()) {
                emitters.remove(userId);
            }
        }
    }
}
