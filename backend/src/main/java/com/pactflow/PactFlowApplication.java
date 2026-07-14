package com.pactflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * PactFlow API Application Entry Point.
 *
 * <p>Spring Boot application with Clean Architecture (domain → application → infrastructure).
 * Virtual Threads enabled globally via {@code spring.threads.virtual.enabled=true}
 * per SYSTEM_ARCHITECTURE.md §5.1.</p>
 *
 * <p>Bounded Contexts:
 * <ul>
 *   <li>IDENTITY — Users, WalletConnections, UserSessions</li>
 *   <li>COLLABORATION — Projects, Milestones, Deliverables, Comments</li>
 *   <li>ESCROW — EscrowContracts, BlockchainTransactions (write-protected, daemon-only)</li>
 *   <li>NOTIFICATION — Notifications, ActivityEvents, OutboxEvents</li>
 *   <li>ANALYTICS — UserMetricSnapshots, PlatformDailySnapshots (read models)</li>
 * </ul>
 * </p>
 */
@SpringBootApplication
@ConfigurationPropertiesScan("com.pactflow")
@EnableScheduling
public class PactFlowApplication {

    /**
     * Application entry point.
     *
     * @param args command-line arguments passed by the JVM
     */
    public static void main(final String[] args) {
        SpringApplication.run(PactFlowApplication.class, args);
    }
}
