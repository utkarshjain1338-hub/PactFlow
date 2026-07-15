package com.pactflow.infrastructure.web.controller;

import com.pactflow.application.auth.AuthService;
import com.pactflow.application.auth.dto.AuthResponse;
import com.pactflow.application.auth.dto.ForgotPasswordRequest;
import com.pactflow.application.auth.dto.LoginRequest;
import com.pactflow.application.auth.dto.LogoutRequest;
import com.pactflow.application.auth.dto.MessageResponse;
import com.pactflow.application.auth.dto.RefreshTokenRequest;
import com.pactflow.application.auth.dto.RegisterRequest;
import com.pactflow.application.auth.dto.RegisterResponse;
import com.pactflow.application.auth.dto.ResetPasswordRequest;
import com.pactflow.application.auth.dto.UserMeResponse;
import com.pactflow.application.auth.dto.UserSummaryDto;
import com.pactflow.application.auth.dto.VerifyEmailRequest;
import com.pactflow.infrastructure.web.exception.AuthorizationException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * REST Controller providing Domain 1 (Authentication) endpoints.
 * Authority: API_SPECIFICATION.md Domain 1.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Registers a new user account.
     *
     * @param request            registration payload
     * @param httpServletRequest HTTP request object
     * @return 201 Created with registration summary
     */
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody final RegisterRequest request,
            final HttpServletRequest httpServletRequest) {
        final String ip = extractIpAddress(httpServletRequest);
        final String userAgent = httpServletRequest.getHeader("User-Agent");
        final RegisterResponse response = authService.register(request, ip, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Authenticates a user and issues JWT tokens.
     *
     * @param request            login payload
     * @param httpServletRequest HTTP request object
     * @return 200 OK with access and refresh tokens
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody final LoginRequest request,
            final HttpServletRequest httpServletRequest) {
        final String ip = extractIpAddress(httpServletRequest);
        final String userAgent = httpServletRequest.getHeader("User-Agent");
        final AuthResponse response = authService.login(request, ip, userAgent);
        return ResponseEntity.ok(response);
    }

    /**
     * Rotates session tokens using a valid refresh token.
     *
     * @param request            refresh payload
     * @param httpServletRequest HTTP request object
     * @return 200 OK with new access and refresh tokens
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @Valid @RequestBody final RefreshTokenRequest request,
            final HttpServletRequest httpServletRequest) {
        final String ip = extractIpAddress(httpServletRequest);
        final String userAgent = httpServletRequest.getHeader("User-Agent");
        final AuthResponse response = authService.refresh(request, ip, userAgent);
        return ResponseEntity.ok(response);
    }

    /**
     * Invalidates a user session.
     *
     * @param request logout payload containing refresh token
     * @return 204 No Content
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody final LogoutRequest request) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }

    /**
     * Verifies a user's email address using a single-use token.
     *
     * @param request verification payload
     * @return 200 OK with confirmation message
     */
    @PostMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmail(@Valid @RequestBody final VerifyEmailRequest request) {
        final MessageResponse response = authService.verifyEmail(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Initiates password reset flow.
     *
     * @param request forgot password payload containing email
     * @return 202 Accepted with generic confirmation message
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody final ForgotPasswordRequest request) {
        final MessageResponse response = authService.forgotPassword(request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    /**
     * Resets a user's password using a valid reset token.
     *
     * @param request reset password payload
     * @return 200 OK with confirmation message
     */
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody final ResetPasswordRequest request) {
        final MessageResponse response = authService.resetPassword(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves the authenticated user's profile summary.
     *
     * @param principal security principal from context
     * @return 200 OK with user profile details
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserMeResponse> getMe(@AuthenticationPrincipal final Object principal) {
        final UUID userId = extractUserIdFromPrincipal(principal);
        final UserMeResponse response = authService.getMe(userId);
        return ResponseEntity.ok(response);
    }

    private String extractIpAddress(final HttpServletRequest request) {
        final String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private UUID extractUserIdFromPrincipal(final Object principal) {
        if (principal instanceof UUID uuid) {
            return uuid;
        } else if (principal instanceof UserSummaryDto summary) {
            return summary.getId();
        } else if (principal instanceof String str) {
            try {
                return UUID.fromString(str);
            } catch (final IllegalArgumentException e) {
                // fall through
            }
        }
        throw new AuthorizationException("Valid user authentication principal is required.");
    }
}
