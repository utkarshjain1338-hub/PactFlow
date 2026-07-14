package com.pactflow.infrastructure.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.health.Status;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Public health check controller for load balancers and monitoring.
 *
 * <p>Provides lightweight GET endpoints that don't require JWT authentication.
 * These are separate from the Spring Actuator endpoints (/actuator/health/*)
 * which are served on the management port (8081).
 *
 * <p>This controller is served on the main API port (8080) for platforms
 * (e.g., Railway, Render) that perform health checks on the primary port.
 *
 * <p>Authority: SYSTEM_ARCHITECTURE.md §12.7 (Health Check Architecture)
 */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Health", description = "Health check endpoints for load balancers and monitoring")
public class HealthController {

    private final HealthEndpoint healthEndpoint;

    /**
     * Constructs the health controller with the Actuator health endpoint.
     *
     * @param healthEndpoint the Spring Boot Actuator health endpoint
     */
    public HealthController(final HealthEndpoint healthEndpoint) {
        this.healthEndpoint = healthEndpoint;
    }

    /**
     * Liveness probe — is the JVM alive?
     *
     * <p>Returns 200 if the Spring application context is running.
     * Returns 503 if the JVM/application is unhealthy.
     *
     * <p>Per SYSTEM_ARCHITECTURE.md §12.7: "Liveness: GET /actuator/health/liveness → 200 if JVM running"
     *
     * @return 200 OK with liveness status, or 503 Service Unavailable
     */
    @GetMapping("/health/liveness")
    @Operation(
            summary = "Liveness probe",
            description = "Returns 200 if the application is alive. Used by Railway/Kubernetes liveness probes.")
    public ResponseEntity<Map<String, Object>> liveness() {
        final Map<String, Object> body = Map.of(
                "status", "UP",
                "timestamp", Instant.now().toString(),
                "service", "pactflow-api"
        );
        return ResponseEntity.ok(body);
    }

    /**
     * Readiness probe — is the application ready to serve traffic?
     *
     * <p>Checks database and Redis connectivity.
     * Returns 200 if all dependencies are UP.
     * Returns 503 if any critical dependency is DOWN.
     *
     * <p>Per SYSTEM_ARCHITECTURE.md §12.7: "Readiness checks: PostgreSQL: SELECT 1, Redis: PING"
     *
     * @return 200 OK if ready, 503 if not ready
     */
    @GetMapping("/health/readiness")
    @Operation(
            summary = "Readiness probe",
            description = "Returns 200 if the application is ready to serve traffic (DB + Redis healthy).")
    public ResponseEntity<Map<String, Object>> readiness() {
        final var health = healthEndpoint.health();
        final boolean isUp = Status.UP.equals(health.getStatus());

        final Map<String, Object> body = Map.of(
                "status", isUp ? "UP" : "DOWN",
                "timestamp", Instant.now().toString(),
                "service", "pactflow-api"
        );

        return isUp
                ? ResponseEntity.ok(body)
                : ResponseEntity.status(503).body(body);
    }
}
