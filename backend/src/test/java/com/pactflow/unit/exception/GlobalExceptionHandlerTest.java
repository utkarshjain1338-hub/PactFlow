package com.pactflow.unit.exception;

import com.pactflow.infrastructure.web.exception.AuthorizationException;
import com.pactflow.infrastructure.web.exception.BlockchainCommunicationException;
import com.pactflow.infrastructure.web.exception.BusinessRuleViolationException;
import com.pactflow.infrastructure.web.exception.DuplicateResourceException;
import com.pactflow.infrastructure.web.exception.EntityNotFoundException;
import com.pactflow.infrastructure.web.exception.ExternalServiceException;
import com.pactflow.infrastructure.web.exception.GlobalExceptionHandler;
import com.pactflow.infrastructure.web.exception.InvalidStateTransitionException;
import com.pactflow.infrastructure.web.exception.ValidationException;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link GlobalExceptionHandler}.
 *
 * <p>Verifies that all domain and infrastructure exceptions map to RFC 7807
 * ProblemDetail responses with exact HTTP status codes per API_SPECIFICATION.md §1.3
 * and SYSTEM_ARCHITECTURE.md §5.5.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("GlobalExceptionHandler RFC 7807 responses")
class GlobalExceptionHandlerTest {

    @Mock
    private HttpServletRequest request;

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
        when(request.getRequestURI()).thenReturn("/api/v1/test/123");
    }

    @Test
    @DisplayName("EntityNotFoundException should return 404 NOT_FOUND")
    void handleEntityNotFoundShouldReturn404() {
        final var ex = new EntityNotFoundException("Project", UUID.randomUUID());
        final ResponseEntity<ProblemDetail> response = handler.handleEntityNotFound(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(404);
        assertThat(response.getBody().getType().toString()).contains("NOT_FOUND");
        assertThat(response.getBody().getInstance().toString()).isEqualTo("/api/v1/test/123");
    }

    @Test
    @DisplayName("InvalidStateTransitionException should return 409 CONFLICT")
    void handleInvalidStateTransitionShouldReturn409() {
        final var ex = new InvalidStateTransitionException("Milestone", "DRAFT", "PAID");
        final ResponseEntity<ProblemDetail> response = handler.handleInvalidStateTransition(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(409);
        assertThat(response.getBody().getType().toString()).contains("INVALID_STATE_TRANSITION");
    }

    @Test
    @DisplayName("BusinessRuleViolationException should return 409 CONFLICT")
    void handleBusinessRuleViolationShouldReturn409() {
        final var ex = new BusinessRuleViolationException("Client and assignee cannot be the same user.");
        final ResponseEntity<ProblemDetail> response = handler.handleBusinessRuleViolation(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(409);
        assertThat(response.getBody().getType().toString()).contains("BUSINESS_RULE_VIOLATION");
    }

    @Test
    @DisplayName("DuplicateResourceException should return 409 CONFLICT")
    void handleDuplicateResourceShouldReturn409() {
        final var ex = new DuplicateResourceException("User with email already exists.");
        final ResponseEntity<ProblemDetail> response = handler.handleDuplicateResource(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(409);
        assertThat(response.getBody().getType().toString()).contains("DUPLICATE_RESOURCE");
    }

    @Test
    @DisplayName("AuthorizationException should return 403 FORBIDDEN")
    void handleAuthorizationExceptionShouldReturn403() {
        final var ex = new AuthorizationException("Only the client can fund this milestone.");
        final ResponseEntity<ProblemDetail> response = handler.handleAuthorizationException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(403);
        assertThat(response.getBody().getType().toString()).contains("FORBIDDEN");
    }

    @Test
    @DisplayName("ValidationException should return 422 UNPROCESSABLE_ENTITY")
    void handleValidationExceptionShouldReturn422() {
        final var ex = new ValidationException("Budget must exceed total milestone allocations.");
        final ResponseEntity<ProblemDetail> response = handler.handleValidationException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(422);
        assertThat(response.getBody().getType().toString()).contains("VALIDATION_FAILED");
    }

    @Test
    @DisplayName("BlockchainCommunicationException should return 503 SERVICE_UNAVAILABLE")
    void handleBlockchainCommunicationShouldReturn503() {
        final var ex = new BlockchainCommunicationException("Soroban RPC timeout after 5000ms.");
        final ResponseEntity<ProblemDetail> response = handler.handleBlockchainCommunication(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(503);
        assertThat(response.getBody().getType().toString()).contains("BLOCKCHAIN_UNAVAILABLE");
    }

    @Test
    @DisplayName("ExternalServiceException should return 503 SERVICE_UNAVAILABLE")
    void handleExternalServiceShouldReturn503() {
        final var ex = new ExternalServiceException("SMTP connection failed.");
        final ResponseEntity<ProblemDetail> response = handler.handleExternalService(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(503);
        assertThat(response.getBody().getType().toString()).contains("EXTERNAL_SERVICE_UNAVAILABLE");
    }

    @Test
    @DisplayName("AccessDeniedException should return 403 FORBIDDEN")
    void handleAccessDeniedShouldReturn403() {
        final var ex = new AccessDeniedException("Access denied.");
        final ResponseEntity<ProblemDetail> response = handler.handleAccessDenied(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(403);
        assertThat(response.getBody().getType().toString()).contains("FORBIDDEN");
    }

    @Test
    @DisplayName("IllegalArgumentException should return 422 UNPROCESSABLE_ENTITY")
    void handleIllegalArgumentExceptionShouldReturn422() {
        final var ex = new IllegalArgumentException("Email address does not conform to required format constraints.");
        final ResponseEntity<ProblemDetail> response = handler.handleIllegalArgumentException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(422);
        assertThat(response.getBody().getType().toString()).contains("VALIDATION_FAILED");
        assertThat(response.getBody().getDetail()).isEqualTo("Email address does not conform to required format constraints.");
    }

    @Test
    @DisplayName("Unhandled exception should return 500 INTERNAL_SERVER_ERROR")
    void handleUnexpectedShouldReturn500() {
        final var ex = new RuntimeException("Null pointer occurred.");
        final ResponseEntity<ProblemDetail> response = handler.handleUnexpected(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(500);
        assertThat(response.getBody().getType().toString()).contains("INTERNAL_ERROR");
        assertThat(response.getBody().getDetail()).contains("An unexpected error occurred");
    }
}
