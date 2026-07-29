package com.pactflow.application.event;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class SseTicketService {
    private final Map<String, UUID> activeTickets = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    /**
     * Generates a ticket for the user.
     *
     * @param userId the user ID
     * @return the ticket
     */
    public String generateTicket(UUID userId) {
        String ticket = UUID.randomUUID().toString();
        activeTickets.put(ticket, userId);
        
        // Ticket expires in 60 seconds
        scheduler.schedule(() -> activeTickets.remove(ticket), 60, TimeUnit.SECONDS);
        
        return ticket;
    }

    /**
     * Validates and consumes a ticket.
     *
     * @param ticket the ticket
     * @return the user ID
     */
    public UUID validateAndConsumeTicket(String ticket) {
        return activeTickets.remove(ticket);
    }
}
