package com.pactflow.unit.web;

import com.pactflow.infrastructure.web.controller.HealthController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.health.Status;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link HealthController}.
 *
 * <p>Verifies liveness and readiness probe responses per SYSTEM_ARCHITECTURE.md §12.7.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("HealthController probe endpoints")
class HealthControllerTest {

    @Mock
    private HealthEndpoint healthEndpoint;

    private HealthController healthController;

    @BeforeEach
    void setUp() {
        healthController = new HealthController(healthEndpoint);
    }

    @Test
    @DisplayName("Liveness probe should return 200 UP")
    void livenessShouldReturn200Up() {
        final ResponseEntity<Map<String, Object>> response = healthController.liveness();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("status")).isEqualTo("UP");
        assertThat(response.getBody().get("service")).isEqualTo("pactflow-api");
        assertThat(response.getBody().get("timestamp")).isNotNull();
    }

    @Test
    @DisplayName("Readiness probe should return 200 UP when actuator status is UP")
    void readinessShouldReturn200WhenActuatorIsUp() {
        when(healthEndpoint.health()).thenReturn(Health.status(Status.UP).build());

        final ResponseEntity<Map<String, Object>> response = healthController.readiness();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("status")).isEqualTo("UP");
        assertThat(response.getBody().get("service")).isEqualTo("pactflow-api");
    }

    @Test
    @DisplayName("Readiness probe should return 503 DOWN when actuator status is DOWN")
    void readinessShouldReturn503WhenActuatorIsDown() {
        when(healthEndpoint.health()).thenReturn(Health.status(Status.DOWN).build());

        final ResponseEntity<Map<String, Object>> response = healthController.readiness();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("status")).isEqualTo("DOWN");
    }

    @Test
    @DisplayName("Readiness probe should return 503 DOWN when actuator status is OUT_OF_SERVICE")
    void readinessShouldReturn503WhenActuatorIsOutOfService() {
        when(healthEndpoint.health()).thenReturn(Health.status(Status.OUT_OF_SERVICE).build());

        final ResponseEntity<Map<String, Object>> response = healthController.readiness();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("status")).isEqualTo("DOWN");
    }
}
