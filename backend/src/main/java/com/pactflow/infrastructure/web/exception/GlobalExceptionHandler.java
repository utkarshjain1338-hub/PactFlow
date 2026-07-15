package com.pactflow.infrastructure.web.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.net.URI;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Global exception handler returning RFC 7807 Problem Details JSON responses.
 *
 * <p>Authority: API_SPECIFICATION.md §1.3 (Global Error Response Format) and
 * SYSTEM_ARCHITECTURE.md §5.5 (Exception Handling).
 *
 * <p>All responses conform to:
 * <pre>
 * {
 *   "type":      "https://api.pactflow.io/errors/{error-code}",
 *   "title":     "Human-readable error title",
 *   "status":    422,
 *   "detail":    "Detailed explanation.",
 *   "instance":  "/api/v1/projects/...",
 *   "timestamp": "2026-07-12T06:30:00Z",
 *   "traceId":   "...",
 *   "errors":    [...]  // only on 422 validation failures
 * }
 * </pre>
 *
 * <p>Exception hierarchy handled (SYSTEM_ARCHITECTURE.md §5.5):
 * <ul>
 *   <li>PactFlowException (base)</li>
 *   <li>├── DomainException → 409</li>
 *   <li>│   ├── InvalidStateTransitionException → 409</li>
 *   <li>│   ├── BusinessRuleViolationException → 409</li>
 *   <li>│   └── EntityNotFoundException → 404</li>
 *   <li>├── ApplicationException → 422</li>
 *   <li>│   ├── DuplicateResourceException → 409</li>
 *   <li>│   ├── AuthorizationException → 403</li>
 *   <li>│   └── ValidationException → 422</li>
 *   <li>└── InfrastructureException → 503</li>
 *       <li>├── BlockchainCommunicationException → 503</li>
 *       <li>└── ExternalServiceException → 503</li>
 * </ul>
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger LOG = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final String ERROR_BASE_URI = "https://api.pactflow.io/errors/";

    // ─── Domain Exceptions ─────────────────────────────────────────────────

    /** Handles entity not found (404). */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ProblemDetail> handleEntityNotFound(
            final EntityNotFoundException ex,
            final HttpServletRequest request) {
        LOG.warn("Entity not found: {}", ex.getMessage());
        final ProblemDetail detail = buildProblemDetail(
                HttpStatus.NOT_FOUND, "NOT_FOUND", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(detail);
    }

    /** Handles invalid state machine transitions (409). */
    @ExceptionHandler(InvalidStateTransitionException.class)
    public ResponseEntity<ProblemDetail> handleInvalidStateTransition(
            final InvalidStateTransitionException ex,
            final HttpServletRequest request) {
        LOG.warn("Invalid state transition: {}", ex.getMessage());
        final ProblemDetail detail = buildProblemDetail(
                HttpStatus.CONFLICT, "INVALID_STATE_TRANSITION", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(detail);
    }

    /** Handles business rule violations (409). */
    @ExceptionHandler(BusinessRuleViolationException.class)
    public ResponseEntity<ProblemDetail> handleBusinessRuleViolation(
            final BusinessRuleViolationException ex,
            final HttpServletRequest request) {
        LOG.warn("Business rule violation: {}", ex.getMessage());
        final ProblemDetail detail = buildProblemDetail(
                HttpStatus.CONFLICT, "BUSINESS_RULE_VIOLATION", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(detail);
    }

    /** Handles duplicate resources (409). */
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ProblemDetail> handleDuplicateResource(
            final DuplicateResourceException ex,
            final HttpServletRequest request) {
        LOG.warn("Duplicate resource: {}", ex.getMessage());
        final ProblemDetail detail = buildProblemDetail(
                HttpStatus.CONFLICT, "DUPLICATE_RESOURCE", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(detail);
    }

    /** Handles application-level authorization failures (403). */
    @ExceptionHandler(AuthorizationException.class)
    public ResponseEntity<ProblemDetail> handleAuthorizationException(
            final AuthorizationException ex,
            final HttpServletRequest request) {
        LOG.warn("Authorization failure: {} — requestUri={}", ex.getMessage(), request.getRequestURI());
        final ProblemDetail detail = buildProblemDetail(
                HttpStatus.FORBIDDEN, "FORBIDDEN", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(detail);
    }

    /** Handles application-level validation exceptions (422). */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ProblemDetail> handleValidationException(
            final ValidationException ex,
            final HttpServletRequest request) {
        LOG.debug("Validation failure: {}", ex.getMessage());
        final ProblemDetail detail = buildProblemDetail(
                HttpStatus.UNPROCESSABLE_ENTITY, "VALIDATION_FAILED", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(detail);
    }

    /** Handles blockchain communication failures (503). */
    @ExceptionHandler(BlockchainCommunicationException.class)
    public ResponseEntity<ProblemDetail> handleBlockchainCommunication(
            final BlockchainCommunicationException ex,
            final HttpServletRequest request) {
        LOG.error("Blockchain communication error: {}", ex.getMessage(), ex);
        final ProblemDetail detail = buildProblemDetail(
                HttpStatus.SERVICE_UNAVAILABLE, "BLOCKCHAIN_UNAVAILABLE",
                "Blockchain service is temporarily unavailable. Please retry.", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(detail);
    }

    /** Handles external service failures (503). */
    @ExceptionHandler(ExternalServiceException.class)
    public ResponseEntity<ProblemDetail> handleExternalService(
            final ExternalServiceException ex,
            final HttpServletRequest request) {
        LOG.error("External service error: {}", ex.getMessage(), ex);
        final ProblemDetail detail = buildProblemDetail(
                HttpStatus.SERVICE_UNAVAILABLE, "EXTERNAL_SERVICE_UNAVAILABLE",
                "An external dependency is temporarily unavailable.", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(detail);
    }

    // ─── Auth & Identity Exceptions ────────────────────────────────────────

    /** Handles invalid credentials or token replay (401). */
    @ExceptionHandler({InvalidCredentialsException.class, TokenReplayException.class})
    public ResponseEntity<ProblemDetail> handleUnauthorizedAuth(
            final PactFlowException ex,
            final HttpServletRequest request) {
        LOG.warn("Auth failure (401): {} — uri={}", ex.getMessage(), request.getRequestURI());
        final ProblemDetail detail = buildProblemDetail(
                HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(detail);
    }

    /** Handles deactivated or locked accounts (403). */
    @ExceptionHandler({AccountDeactivatedException.class, AccountLockedException.class})
    public ResponseEntity<ProblemDetail> handleForbiddenAuth(
            final PactFlowException ex,
            final HttpServletRequest request) {
        LOG.warn("Auth forbidden (403): {} — uri={}", ex.getMessage(), request.getRequestURI());
        final String errorCode = ex instanceof AccountLockedException ? "ACCOUNT_LOCKED" : "ACCOUNT_DEACTIVATED";
        final ProblemDetail detail = buildProblemDetail(
                HttpStatus.FORBIDDEN, errorCode, ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(detail);
    }

    /** Handles expired or consumed tokens (410). */
    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<ProblemDetail> handleTokenExpired(
            final TokenExpiredException ex,
            final HttpServletRequest request) {
        LOG.debug("Token expired or consumed (410): {} — uri={}", ex.getMessage(), request.getRequestURI());
        final ProblemDetail detail = buildProblemDetail(
                HttpStatus.GONE, "TOKEN_EXPIRED", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.GONE).body(detail);
    }

    /** Handles weak passwords (422). */
    @ExceptionHandler(WeakPasswordException.class)
    public ResponseEntity<ProblemDetail> handleWeakPassword(
            final WeakPasswordException ex,
            final HttpServletRequest request) {
        LOG.debug("Weak password (422): {} — uri={}", ex.getMessage(), request.getRequestURI());
        final ProblemDetail detail = buildProblemDetail(
                HttpStatus.UNPROCESSABLE_ENTITY, "WEAK_PASSWORD", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(detail);
    }

    // ─── Spring Security Exceptions ────────────────────────────────────────

    /** Handles Spring Security authentication failures (401). */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ProblemDetail> handleAuthentication(
            final AuthenticationException ex,
            final HttpServletRequest request) {
        LOG.debug("Authentication failure: {}", ex.getMessage());
        final ProblemDetail detail = buildProblemDetail(
                HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication required.", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(detail);
    }

    /** Handles Spring Security access denied (403). */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ProblemDetail> handleAccessDenied(
            final AccessDeniedException ex,
            final HttpServletRequest request) {
        LOG.warn("Access denied: {} — uri={}", ex.getMessage(), request.getRequestURI());
        final ProblemDetail detail = buildProblemDetail(
                HttpStatus.FORBIDDEN, "FORBIDDEN",
                "You do not have permission to perform this action.", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(detail);
    }

    // ─── Spring Framework Validation ───────────────────────────────────────

    /** Handles @Valid bean validation failures (422) — returns errors[] array. */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            final MethodArgumentNotValidException ex,
            final HttpHeaders headers,
            final HttpStatusCode status,
            final WebRequest request) {

        final List<FieldValidationError> errors = new ArrayList<>();
        for (final FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.add(new FieldValidationError(
                    fieldError.getField(),
                    fieldError.getCode(),
                    fieldError.getDefaultMessage()));
        }

        final ProblemDetail detail = ProblemDetail.forStatusAndDetail(
                HttpStatus.UNPROCESSABLE_ENTITY, "One or more fields failed validation.");
        detail.setType(URI.create(ERROR_BASE_URI + "VALIDATION_FAILED"));
        detail.setTitle("Validation Failed");
        detail.setProperty("timestamp", Instant.now().toString());
        detail.setProperty("traceId", getTraceId());
        detail.setProperty("errors", errors);

        LOG.debug("Bean validation failed: {} errors", errors.size());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(detail);
    }

    /** Handles constraint violation exceptions (422). */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ProblemDetail> handleConstraintViolation(
            final ConstraintViolationException ex,
            final HttpServletRequest request) {

        final List<FieldValidationError> errors = new ArrayList<>();
        for (final ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            errors.add(new FieldValidationError(
                    violation.getPropertyPath().toString(),
                    violation.getConstraintDescriptor().getAnnotation().annotationType().getSimpleName(),
                    violation.getMessage()));
        }

        final ProblemDetail detail = buildProblemDetail(
                HttpStatus.UNPROCESSABLE_ENTITY, "VALIDATION_FAILED",
                "One or more parameters failed validation.", request.getRequestURI());
        detail.setProperty("errors", errors);

        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(detail);
    }

    /** Handles malformed JSON body (400). */
    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            final HttpMessageNotReadableException ex,
            final HttpHeaders headers,
            final HttpStatusCode status,
            final WebRequest request) {
        LOG.debug("Malformed request body: {}", ex.getMessage());
        final ProblemDetail detail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "Request body is malformed or missing required fields.");
        detail.setType(URI.create(ERROR_BASE_URI + "BAD_REQUEST"));
        detail.setTitle("Bad Request");
        detail.setProperty("timestamp", Instant.now().toString());
        detail.setProperty("traceId", getTraceId());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(detail);
    }

    /** Handles missing required query parameters (400). */
    @Override
    protected ResponseEntity<Object> handleMissingServletRequestParameter(
            final MissingServletRequestParameterException ex,
            final HttpHeaders headers,
            final HttpStatusCode status,
            final WebRequest request) {
        final ProblemDetail detail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "Required query parameter '" + ex.getParameterName() + "' is missing.");
        detail.setType(URI.create(ERROR_BASE_URI + "MISSING_PARAMETER"));
        detail.setTitle("Missing Parameter");
        detail.setProperty("timestamp", Instant.now().toString());
        detail.setProperty("traceId", getTraceId());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(detail);
    }

    // ─── Fallback ───────────────────────────────────────────────────────────

    /** Catches all unhandled exceptions (500). */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleUnexpected(
            final Exception ex,
            final HttpServletRequest request) {
        final String traceId = getTraceId();
        LOG.error("Unexpected error [traceId={}] at {}: {}", traceId, request.getRequestURI(), ex.getMessage(), ex);
        final ProblemDetail detail = buildProblemDetail(
                HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                "An unexpected error occurred. Reference ID: " + traceId, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(detail);
    }

    // ─── Helpers ────────────────────────────────────────────────────────────

    private ProblemDetail buildProblemDetail(
            final HttpStatus status,
            final String errorCode,
            final String detail,
            final String instance) {
        final ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, detail);
        problemDetail.setType(URI.create(ERROR_BASE_URI + errorCode));
        problemDetail.setTitle(status.getReasonPhrase());
        problemDetail.setProperty("timestamp", Instant.now().toString());
        problemDetail.setProperty("traceId", getTraceId());
        if (instance != null) {
            problemDetail.setInstance(URI.create(instance));
        }
        return problemDetail;
    }

    private String getTraceId() {
        // In production, this would be extracted from the MDC (set by Spring Sleuth / Micrometer Tracing).
        // Falls back to a generated UUID if no trace context is active.
        final String mdcTraceId = org.slf4j.MDC.get("traceId");
        return (mdcTraceId != null && !mdcTraceId.isBlank()) ? mdcTraceId : UUID.randomUUID().toString();
    }

    /** Field-level validation error DTO per API_SPECIFICATION.md §1.3. */
    public record FieldValidationError(String field, String code, String message) {
    }
}
