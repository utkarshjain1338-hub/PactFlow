package com.pactflow.infrastructure.web.controller;

import com.pactflow.application.auth.AuthService;
import com.pactflow.application.auth.dto.*;
import com.pactflow.infrastructure.web.security.ClientIpExtractor;
import com.pactflow.infrastructure.web.security.PrincipalExtractor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST Controller providing Domain 1 (Authentication) endpoints.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody final RegisterRequest request,
            final HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.register(request, ClientIpExtractor.from(req), req.getHeader("User-Agent")));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody final LoginRequest request,
            final HttpServletRequest req) {
        return ResponseEntity.ok(authService.login(request, ClientIpExtractor.from(req), req.getHeader("User-Agent")));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @Valid @RequestBody final RefreshTokenRequest request,
            final HttpServletRequest req) {
        return ResponseEntity.ok(authService.refresh(request, ClientIpExtractor.from(req), req.getHeader("User-Agent")));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody final LogoutRequest request) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmail(@Valid @RequestBody final VerifyEmailRequest request) {
        return ResponseEntity.ok(authService.verifyEmail(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody final ForgotPasswordRequest request) {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody final ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserMeResponse> getMe(@AuthenticationPrincipal final Object principal) {
        return ResponseEntity.ok(authService.getMe(PrincipalExtractor.extractUserId(principal)));
    }
}
