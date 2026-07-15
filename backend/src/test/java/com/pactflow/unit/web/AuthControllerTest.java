package com.pactflow.unit.web;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import com.pactflow.domain.user.AccountType;
import com.pactflow.infrastructure.web.controller.AuthController;
import com.pactflow.infrastructure.web.security.JwtAuthenticationFilter;
import com.pactflow.infrastructure.web.security.RateLimitFilter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.ArrayList;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("AuthController WebMvc unit tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private RateLimitFilter rateLimitFilter;

    @Test
    @DisplayName("POST /api/v1/auth/register should return 201 Created with valid payload")
    void shouldRegisterUser() throws Exception {
        final RegisterRequest req = RegisterRequest.builder()
                .email("test@pactflow.io")
                .password("SecurePass123!")
                .accountType(AccountType.FREELANCER)
                .displayName("Test Freelancer")
                .timezone("UTC")
                .build();

        final RegisterResponse res = RegisterResponse.builder()
                .id(UUID.randomUUID())
                .email("test@pactflow.io")
                .accountType(AccountType.FREELANCER)
                .displayName("Test Freelancer")
                .isEmailVerified(false)
                .createdAt(Instant.now())
                .build();

        when(authService.register(any(RegisterRequest.class), anyString(), any())).thenReturn(res);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("test@pactflow.io"))
                .andExpect(jsonPath("$.accountType").value("FREELANCER"))
                .andExpect(jsonPath("$.isEmailVerified").value(false));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login should return 200 OK with access and refresh tokens")
    void shouldLoginUser() throws Exception {
        final LoginRequest req = new LoginRequest("test@pactflow.io", "SecurePass123!");

        final AuthResponse res = AuthResponse.builder()
                .accessToken("accessToken123")
                .refreshToken("refreshToken123")
                .tokenType("Bearer")
                .expiresIn(900L)
                .user(UserSummaryDto.builder()
                        .id(UUID.randomUUID())
                        .email("test@pactflow.io")
                        .accountType(AccountType.COMPANY)
                        .displayName("Client")
                        .build())
                .build();

        when(authService.login(any(LoginRequest.class), anyString(), any())).thenReturn(res);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("accessToken123"))
                .andExpect(jsonPath("$.refreshToken").value("refreshToken123"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(900));
    }

    @Test
    @DisplayName("POST /api/v1/auth/refresh should return 200 OK with rotated tokens")
    void shouldRefreshToken() throws Exception {
        final RefreshTokenRequest req = new RefreshTokenRequest("oldRefreshToken");

        final AuthResponse res = AuthResponse.builder()
                .accessToken("newAccessToken")
                .refreshToken("newRefreshToken")
                .tokenType("Bearer")
                .expiresIn(900L)
                .build();

        when(authService.refresh(any(RefreshTokenRequest.class), anyString(), any())).thenReturn(res);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("newAccessToken"))
                .andExpect(jsonPath("$.refreshToken").value("newRefreshToken"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/logout should return 204 No Content")
    void shouldLogoutUser() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LogoutRequest("tokenToRevoke"))))
                .andExpect(status().isNoContent());

        verify(authService).logout(any(LogoutRequest.class));
    }

    @Test
    @DisplayName("POST /api/v1/auth/verify-email should return 200 OK with message")
    void shouldVerifyEmail() throws Exception {
        when(authService.verifyEmail(any(VerifyEmailRequest.class)))
                .thenReturn(new MessageResponse("Email successfully verified."));

        mockMvc.perform(post("/api/v1/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new VerifyEmailRequest("validToken"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Email successfully verified."));
    }

    @Test
    @DisplayName("POST /api/v1/auth/forgot-password should return 202 Accepted with generic status")
    void shouldForgotPassword() throws Exception {
        when(authService.forgotPassword(any(ForgotPasswordRequest.class)))
                .thenReturn(new MessageResponse("If that email is registered, a password reset link will be sent shortly."));

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ForgotPasswordRequest("user@pactflow.io"))))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.message").value(containsString("reset link will be sent shortly")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/reset-password should return 200 OK after resetting password")
    void shouldResetPassword() throws Exception {
        when(authService.resetPassword(any(ResetPasswordRequest.class)))
                .thenReturn(new MessageResponse("Password successfully reset. Please log in with your new credentials."));

        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ResetPasswordRequest("token123", "NewStrongPass123!"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(containsString("Password successfully reset")));
    }

    @Test
    @DisplayName("GET /api/v1/auth/me should return 200 OK with authenticated user profile")
    void shouldGetMe() throws Exception {
        final UUID userId = UUID.randomUUID();
        final UserMeResponse res = UserMeResponse.builder()
                .id(userId)
                .email("alice@pactflow.io")
                .accountType(AccountType.FREELANCER)
                .displayName("Alice Mercer")
                .isEmailVerified(true)
                .isActive(true)
                .wallets(new ArrayList<>())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(authService.getMe(userId)).thenReturn(res);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(userId, null, new ArrayList<>())
        );

        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.email").value("alice@pactflow.io"))
                .andExpect(jsonPath("$.accountType").value("FREELANCER"));

        SecurityContextHolder.clearContext();
    }
}
