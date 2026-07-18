package com.pactflow.infrastructure.web.exception;

import com.pactflow.application.user.exception.ActiveMilestonesPreventErasureException;
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
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger LOG = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final String ERROR_BASE_URI = "https://api.pactflow.io/errors/";

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ProblemDetail> handleEntityNotFound(
            final EntityNotFoundException ex, final HttpServletRequest req) {
        return respond(HttpStatus.NOT_FOUND, "NOT_FOUND", ex.getMessage(), req);
    }

    @ExceptionHandler(InvalidStateTransitionException.class)
    public ResponseEntity<ProblemDetail> handleInvalidStateTransition(
            final InvalidStateTransitionException ex, final HttpServletRequest req) {
        return respond(HttpStatus.CONFLICT, "INVALID_STATE_TRANSITION", ex.getMessage(), req);
    }

    @ExceptionHandler(ActiveMilestonesPreventErasureException.class)
    public ResponseEntity<ProblemDetail> handleActiveMilestonesPreventErasure(
            final ActiveMilestonesPreventErasureException ex, final HttpServletRequest req) {
        return respond(HttpStatus.CONFLICT, "ACTIVE_MILESTONES_PREVENT_ERASURE", ex.getMessage(), req);
    }

    @ExceptionHandler(BusinessRuleViolationException.class)
    public ResponseEntity<ProblemDetail> handleBusinessRuleViolation(
            final BusinessRuleViolationException ex, final HttpServletRequest req) {
        return respond(HttpStatus.CONFLICT, "BUSINESS_RULE_VIOLATION", ex.getMessage(), req);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ProblemDetail> handleDuplicateResource(
            final DuplicateResourceException ex, final HttpServletRequest req) {
        return respond(HttpStatus.CONFLICT, "DUPLICATE_RESOURCE", ex.getMessage(), req);
    }

    @ExceptionHandler(AuthorizationException.class)
    public ResponseEntity<ProblemDetail> handleAuthorizationException(
            final AuthorizationException ex, final HttpServletRequest req) {
        return respond(HttpStatus.FORBIDDEN, "FORBIDDEN", ex.getMessage(), req);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ProblemDetail> handleValidationException(
            final ValidationException ex, final HttpServletRequest req) {
        return respond(HttpStatus.UNPROCESSABLE_ENTITY, "VALIDATION_FAILED", ex.getMessage(), req);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ProblemDetail> handleIllegalArgumentException(
            final IllegalArgumentException ex, final HttpServletRequest req) {
        return respond(HttpStatus.UNPROCESSABLE_ENTITY, "VALIDATION_FAILED", ex.getMessage(), req);
    }

    @ExceptionHandler(BlockchainCommunicationException.class)
    public ResponseEntity<ProblemDetail> handleBlockchainCommunication(
            final BlockchainCommunicationException ex, final HttpServletRequest req) {
        LOG.error("Blockchain communication error: {}", ex.getMessage(), ex);
        return respond(HttpStatus.SERVICE_UNAVAILABLE, "BLOCKCHAIN_UNAVAILABLE",
                "Blockchain service is temporarily unavailable. Please retry.", req);
    }

    @ExceptionHandler(ExternalServiceException.class)
    public ResponseEntity<ProblemDetail> handleExternalService(
            final ExternalServiceException ex, final HttpServletRequest req) {
        LOG.error("External service error: {}", ex.getMessage(), ex);
        return respond(HttpStatus.SERVICE_UNAVAILABLE, "EXTERNAL_SERVICE_UNAVAILABLE",
                "An external dependency is temporarily unavailable.", req);
    }

    @ExceptionHandler({InvalidCredentialsException.class, TokenReplayException.class})
    public ResponseEntity<ProblemDetail> handleUnauthorizedAuth(
            final PactFlowException ex, final HttpServletRequest req) {
        return respond(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", ex.getMessage(), req);
    }

    @ExceptionHandler({AccountDeactivatedException.class, AccountLockedException.class})
    public ResponseEntity<ProblemDetail> handleForbiddenAuth(
            final PactFlowException ex, final HttpServletRequest req) {
        final String code = ex instanceof AccountLockedException ? "ACCOUNT_LOCKED" : "ACCOUNT_DEACTIVATED";
        return respond(HttpStatus.FORBIDDEN, code, ex.getMessage(), req);
    }

    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<ProblemDetail> handleTokenExpired(
            final TokenExpiredException ex, final HttpServletRequest req) {
        return respond(HttpStatus.GONE, "TOKEN_EXPIRED", ex.getMessage(), req);
    }

    @ExceptionHandler(WeakPasswordException.class)
    public ResponseEntity<ProblemDetail> handleWeakPassword(
            final WeakPasswordException ex, final HttpServletRequest req) {
        return respond(HttpStatus.UNPROCESSABLE_ENTITY, "WEAK_PASSWORD", ex.getMessage(), req);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ProblemDetail> handleAuthentication(
            final AuthenticationException ex, final HttpServletRequest req) {
        return respond(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication required.", req);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ProblemDetail> handleAccessDenied(
            final AccessDeniedException ex, final HttpServletRequest req) {
        return respond(HttpStatus.FORBIDDEN, "FORBIDDEN",
                "You do not have permission to perform this action.", req);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            final MethodArgumentNotValidException ex, final HttpHeaders headers,
            final HttpStatusCode status, final WebRequest request) {
        final List<FieldValidationError> errors = new ArrayList<>();
        for (final FieldError fe : ex.getBindingResult().getFieldErrors()) {
            errors.add(new FieldValidationError(fe.getField(), fe.getCode(), fe.getDefaultMessage()));
        }
        final ProblemDetail detail = buildDetail(HttpStatus.UNPROCESSABLE_ENTITY, "VALIDATION_FAILED",
                "Validation Failed", "One or more fields failed validation.", null);
        detail.setProperty("errors", errors);
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(detail);
    }

    /**
     * Handles constraint violations (e.g. @Validated on controller parameters).
     *
     * @param ex  ConstraintViolationException
     * @param req HttpServletRequest
     * @return 422 ProblemDetail
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ProblemDetail> handleConstraintViolation(
            final ConstraintViolationException ex, final HttpServletRequest req) {
        final List<FieldValidationError> errors = new ArrayList<>();
        for (final ConstraintViolation<?> v : ex.getConstraintViolations()) {
            errors.add(new FieldValidationError(v.getPropertyPath().toString(),
                    v.getConstraintDescriptor().getAnnotation().annotationType().getSimpleName(),
                    v.getMessage()));
        }
        final ProblemDetail detail = buildDetail(HttpStatus.UNPROCESSABLE_ENTITY, "VALIDATION_FAILED",
                null, "One or more parameters failed validation.", req.getRequestURI());
        detail.setProperty("errors", errors);
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(detail);
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            final HttpMessageNotReadableException ex, final HttpHeaders headers,
            final HttpStatusCode status, final WebRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildDetail(HttpStatus.BAD_REQUEST, "BAD_REQUEST", "Bad Request",
                        "Request body is malformed or missing required fields.", null));
    }

    @Override
    protected ResponseEntity<Object> handleMissingServletRequestParameter(
            final MissingServletRequestParameterException ex, final HttpHeaders headers,
            final HttpStatusCode status, final WebRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildDetail(HttpStatus.BAD_REQUEST, "MISSING_PARAMETER", "Missing Parameter",
                        "Required query parameter '" + ex.getParameterName() + "' is missing.", null));
    }

    /**
     * Fallback handler for all uncaught exceptions.
     *
     * @param ex  caught exception
     * @param req HTTP request
     * @return 500 RFC 7807 problem detail
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleUnexpected(
            final Exception ex, final HttpServletRequest req) {
        final String traceId = getTraceId();
        LOG.error("Unexpected error [traceId={}] at {}: {}", traceId, req.getRequestURI(), ex.getMessage(), ex);
        return respond(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                "An unexpected error occurred. Reference ID: " + traceId, req);
    }

    private ResponseEntity<ProblemDetail> respond(
            final HttpStatus status, final String code, final String msg, final HttpServletRequest req) {
        LOG.warn("{}: {} — uri={}", code, msg, req != null ? req.getRequestURI() : "N/A");
        return ResponseEntity.status(status).body(buildDetail(status, code, null, msg,
                req != null ? req.getRequestURI() : null));
    }

    private ProblemDetail buildDetail(
            final HttpStatus status, final String code, final String title,
            final String msg, final String instance) {
        final ProblemDetail detail = ProblemDetail.forStatusAndDetail(status, msg);
        detail.setType(URI.create(ERROR_BASE_URI + code));
        detail.setTitle(title != null ? title : status.getReasonPhrase());
        detail.setProperty("timestamp", Instant.now().toString());
        detail.setProperty("traceId", getTraceId());
        if (instance != null) {
            detail.setInstance(URI.create(instance));
        }
        return detail;
    }

    private String getTraceId() {
        final String mdcTraceId = org.slf4j.MDC.get("traceId");
        return (mdcTraceId != null && !mdcTraceId.isBlank()) ? mdcTraceId : UUID.randomUUID().toString();
    }

    /**
     * DTO for individual field-level validation errors.
     */
    public record FieldValidationError(String field, String code, String message) {}
}
