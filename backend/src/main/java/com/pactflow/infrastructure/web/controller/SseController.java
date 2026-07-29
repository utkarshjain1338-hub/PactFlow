package com.pactflow.infrastructure.web.controller;

import com.pactflow.application.event.SseEventService;
import com.pactflow.application.event.SseTicketService;
import com.pactflow.application.auth.dto.UserSummaryDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/events")
public class SseController {

    private final SseTicketService sseTicketService;
    private final SseEventService sseEventService;

    public SseController(SseTicketService sseTicketService, SseEventService sseEventService) {
        this.sseTicketService = sseTicketService;
        this.sseEventService = sseEventService;
    }

    @PostMapping("/ticket")
    public ResponseEntity<Map<String, String>> getTicket(@AuthenticationPrincipal UserSummaryDto user) {
        String ticket = sseTicketService.generateTicket(user.id());
        return ResponseEntity.ok(Map.of("ticket", ticket));
    }

    /**
     * Subscribes to the SSE event stream.
     *
     * @param ticket the subscription ticket
     * @param lastEventId the last event ID
     * @return the SSE emitter
     */
    @GetMapping("/subscribe")
    public SseEmitter subscribe(
            @RequestParam("ticket") String ticket,
            @RequestHeader(value = "Last-Event-ID", required = false) String lastEventId) {
        
        UUID userId = sseTicketService.validateAndConsumeTicket(ticket);
        if (userId == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Invalid or expired ticket");
        }

        return sseEventService.subscribe(userId, lastEventId);
    }
}
