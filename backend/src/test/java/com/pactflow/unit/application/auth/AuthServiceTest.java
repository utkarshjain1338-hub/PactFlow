package com.pactflow.unit.application.auth;

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
import com.pactflow.application.auth.dto.VerifyEmailRequest;
import com.pactflow.domain.user.AccountType;
import com.pactflow.domain.user.Email;
import com.pactflow.domain.user.User;
import com.pactflow.domain.user.UserRepository;
import com.pactflow.infrastructure.config.PactFlowProperties;
import com.pactflow.infrastructure.mail.EmailService;
import com.pactflow.infrastructure.persistence.UserSessionRepository;
import com.pactflow.infrastructure.persistence.entity.UserSessionEntity;
import com.pactflow.infrastructure.web.exception.AccountLockedException;
import com.pactflow.infrastructure.web.exception.DuplicateResourceException;
import com.pactflow.infrastructure.web.exception.InvalidCredentialsException;
import com.pactflow.infrastructure.web.exception.TokenExpiredException;
import com.pactflow.infrastructure.web.exception.TokenReplayException;
import com.pactflow.infrastructure.web.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService application layer unit tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserSessionRepository sessionRepository;
    @Mock
    private JwtService jwtService;
    @Mock
    private EmailService emailService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private StringRedisTemplate redisTemplate;
    @Mock
    private ValueOperations<String, String> valueOperations;

    private AuthService authService;
    private PactFlowProperties properties;

    @BeforeEach
    void setUp() {
        properties = new PactFlowProperties();
        properties.getSecurity().getJwt().setAccessTokenTtl(Duration.ofMinutes(15));
        properties.getSecurity().getJwt().setRefreshTokenTtl(Duration.ofDays(30));

        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        lenient().when(passwordEncoder.encode(anyString())).thenAnswer(invocation -> "HASH_" + invocation.getArgument(0));

        authService = new AuthService(
                userRepository,
                sessionRepository,
                jwtService,
                emailService,
                passwordEncoder,
                redisTemplate,
                properties
        );
        authService.init();
    }

    @Test
    @DisplayName("register() should save user, store token in Redis for 24h, and send verification email")
    void shouldRegisterNewUser() {
        final RegisterRequest req = RegisterRequest.builder()
                .email("alice@pactflow.io")
                .password("SecurePass123!")
                .accountType(AccountType.FREELANCER)
                .displayName("Alice Mercer")
                .timezone("UTC")
                .build();

        when(userRepository.existsByEmail(any(Email.class))).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        final RegisterResponse response = authService.register(req, "127.0.0.1", "Mozilla/5.0");

        assertThat(response.email()).isEqualTo("alice@pactflow.io");
        assertThat(response.accountType()).isEqualTo(AccountType.FREELANCER);
        assertThat(response.isEmailVerified()).isFalse();

        verify(valueOperations).set(anyString(), eq(response.id().toString()), eq(Duration.ofHours(24)));
        verify(emailService).sendVerificationEmail(eq("alice@pactflow.io"), eq("Alice Mercer"), anyString());
    }

    @Test
    @DisplayName("register() should throw DuplicateResourceException when email already exists")
    void shouldRejectDuplicateEmailRegistration() {
        final RegisterRequest req = RegisterRequest.builder()
                .email("duplicate@pactflow.io")
                .password("SecurePass123!")
                .accountType(AccountType.COMPANY)
                .displayName("Bob")
                .build();

        when(userRepository.existsByEmail(any(Email.class))).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req, "127.0.0.1", "Agent"))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");

        verify(userRepository, never()).save(any());
        verify(emailService, never()).sendVerificationEmail(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("AT-01 / AT-02: login() should throw AccountLockedException when Redis lockout key is present")
    void shouldThrowWhenAccountIsLocked() {
        final LoginRequest req = new LoginRequest("locked@pactflow.io", "Pass123");
        when(valueOperations.get("auth:login:lockout:locked@pactflow.io")).thenReturn("LOCKED");

        assertThatThrownBy(() -> authService.login(req, "127.0.0.1", "Agent"))
                .isInstanceOf(AccountLockedException.class)
                .hasMessageContaining("locked due to too many failed login attempts");
    }

    @Test
    @DisplayName("AT-10: login() with non-existent email should execute dummy Argon2 check before throwing InvalidCredentialsException")
    void shouldRunTimingSafeCheckWhenUserNotFound() {
        final LoginRequest req = new LoginRequest("unknown@pactflow.io", "Pass123");
        when(valueOperations.get(anyString())).thenReturn(null);
        when(userRepository.findByEmail(any(Email.class))).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(req, "127.0.0.1", "Agent"))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid email or password.");

        // verify dummy hash check was called against timing-safe dummy hash
        verify(passwordEncoder).matches(eq("Pass123"), anyString());
    }

    @Test
    @DisplayName("AT-01: login() with incorrect password should increment failed login attempts and throw InvalidCredentialsException")
    void shouldIncrementFailedAttemptsOnWrongPassword() {
        final UUID id = UUID.randomUUID();
        final User user = new User(id, new Email("alice@pactflow.io"), "realHash", AccountType.FREELANCER, "Alice", "UTC");
        final LoginRequest req = new LoginRequest("alice@pactflow.io", "WrongPass");

        when(valueOperations.get(anyString())).thenReturn(null);
        when(userRepository.findByEmail(any(Email.class))).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPass", "realHash")).thenReturn(false);
        when(valueOperations.increment("auth:login:attempts:alice@pactflow.io")).thenReturn(1L);

        assertThatThrownBy(() -> authService.login(req, "127.0.0.1", "Agent"))
                .isInstanceOf(InvalidCredentialsException.class);

        verify(redisTemplate).expire("auth:login:attempts:alice@pactflow.io", Duration.ofMinutes(15));
    }

    @Test
    @DisplayName("login() with valid credentials should clear attempts, create session, and return tokens")
    void shouldLoginSuccessfully() {
        final UUID userId = UUID.randomUUID();
        final UUID sessionId = UUID.randomUUID();
        final User user = new User(userId, new Email("alice@pactflow.io"), "realHash", AccountType.FREELANCER, "Alice", "UTC");
        final LoginRequest req = new LoginRequest("alice@pactflow.io", "CorrectPass");

        when(valueOperations.get(anyString())).thenReturn(null);
        when(userRepository.findByEmail(any(Email.class))).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("CorrectPass", "realHash")).thenReturn(true);

        final UserSessionEntity sessionEntity = UserSessionEntity.builder()
                .id(sessionId)
                .userId(userId)
                .build();

        when(jwtService.generateRefreshToken()).thenReturn("opaqueRefreshToken");
        when(sessionRepository.createSession(eq(userId), anyString(), eq("opaqueRefreshToken"), anyString(), anyString(), any(Instant.class)))
                .thenReturn(sessionEntity);
        when(jwtService.generateAccessToken(user, sessionId)).thenReturn("jwtAccessToken");

        final AuthResponse res = authService.login(req, "127.0.0.1", "Agent");

        assertThat(res.accessToken()).isEqualTo("jwtAccessToken");
        assertThat(res.refreshToken()).isEqualTo("opaqueRefreshToken");
        assertThat(res.tokenType()).isEqualTo("Bearer");
        verify(redisTemplate).delete("auth:login:attempts:alice@pactflow.io");
    }

    @Test
    @DisplayName("AT-05: refresh() with unknown refresh token should throw TokenReplayException")
    void shouldDetectTokenReplayOnRefresh() {
        when(sessionRepository.findByRefreshToken("unknownToken")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.refresh(new RefreshTokenRequest("unknownToken"), "127.0.0.1", "Agent"))
                .isInstanceOf(TokenReplayException.class)
                .hasMessageContaining("replayed refresh token");
    }

    @Test
    @DisplayName("refresh() with valid session should rotate session tokens and return new tokens")
    void shouldRotateTokensSuccessfully() {
        final UUID userId = UUID.randomUUID();
        final UUID sessionId = UUID.randomUUID();
        final User user = new User(userId, new Email("alice@pactflow.io"), "hash", AccountType.FREELANCER, "Alice", "UTC");
        final UserSessionEntity session = UserSessionEntity.builder()
                .id(sessionId)
                .userId(userId)
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();

        when(sessionRepository.findByRefreshToken("oldRefresh")).thenReturn(Optional.of(session));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(jwtService.generateRefreshToken()).thenReturn("newRefresh");
        when(jwtService.generateAccessToken(user, sessionId)).thenReturn("newAccess");

        final AuthResponse res = authService.refresh(new RefreshTokenRequest("oldRefresh"), "127.0.0.1", "Agent");

        assertThat(res.accessToken()).isEqualTo("newAccess");
        assertThat(res.refreshToken()).isEqualTo("newRefresh");
        verify(sessionRepository).rotateSession(eq(session), eq("newAccess"), eq("newRefresh"), any(Instant.class));
    }

    @Test
    @DisplayName("verifyEmail() should consume token and transition user isEmailVerified to true")
    void shouldVerifyEmailSuccessfully() {
        final UUID userId = UUID.randomUUID();
        final User user = new User(userId, new Email("alice@pactflow.io"), "hash", AccountType.FREELANCER, "Alice", "UTC");

        when(valueOperations.get("auth:verify:token123")).thenReturn(userId.toString());
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        final MessageResponse res = authService.verifyEmail(new VerifyEmailRequest("token123"));

        assertThat(res.message()).contains("verified");
        assertThat(user.isEmailVerified()).isTrue();
        verify(redisTemplate).delete("auth:verify:token123");
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("AT-12: forgotPassword() should always return confirmation even when email does not exist")
    void shouldAlwaysReturnConfirmationForForgotPassword() {
        when(userRepository.findByEmail(any(Email.class))).thenReturn(Optional.empty());

        final MessageResponse res = authService.forgotPassword(new ForgotPasswordRequest("nonexistent@pactflow.io"));
        assertThat(res.message()).contains("password reset link will be sent");
        verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("AT-13: forgotPassword() with existing user should invalidate previous reset token and store new 1h token")
    void shouldInvalidatePreviousResetToken() {
        final UUID userId = UUID.randomUUID();
        final User user = new User(userId, new Email("alice@pactflow.io"), "hash", AccountType.FREELANCER, "Alice", "UTC");

        when(userRepository.findByEmail(any(Email.class))).thenReturn(Optional.of(user));
        when(valueOperations.get("auth:reset:user:" + userId)).thenReturn("oldToken123");

        authService.forgotPassword(new ForgotPasswordRequest("alice@pactflow.io"));

        verify(redisTemplate).delete("auth:reset:oldToken123");
        verify(valueOperations).set(eq("auth:reset:user:" + userId), anyString(), eq(Duration.ofHours(1)));
        verify(emailService).sendPasswordResetEmail(eq("alice@pactflow.io"), eq("Alice"), anyString());
    }

    @Test
    @DisplayName("AT-03: resetPassword() should update password hash and invalidate all active sessions across devices")
    void shouldResetPasswordAndInvalidateAllSessions() {
        final UUID userId = UUID.randomUUID();
        final User user = new User(userId, new Email("alice@pactflow.io"), "oldHash", AccountType.FREELANCER, "Alice", "UTC");

        when(valueOperations.get("auth:reset:validToken")).thenReturn(userId.toString());
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        final MessageResponse res = authService.resetPassword(new ResetPasswordRequest("validToken", "NewStrongPass123!"));

        assertThat(res.message()).contains("Password successfully reset");
        assertThat(user.getPasswordHash()).contains("NewStrongPass123!");
        verify(redisTemplate).delete("auth:reset:validToken");
        verify(redisTemplate).delete("auth:reset:user:" + userId);
        verify(userRepository).save(user);
        verify(sessionRepository).invalidateAllSessionsForUser(userId);
    }

    @Test
    @DisplayName("getMe() should return complete user profile for active user")
    void shouldReturnProfileDetails() {
        final UUID userId = UUID.randomUUID();
        final User user = new User(userId, new Email("alice@pactflow.io"), "hash", AccountType.FREELANCER, "Alice Mercer", "America/New_York");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        final UserMeResponse res = authService.getMe(userId);

        assertThat(res.id()).isEqualTo(userId);
        assertThat(res.email()).isEqualTo("alice@pactflow.io");
        assertThat(res.displayName()).isEqualTo("Alice Mercer");
        assertThat(res.timezone()).isEqualTo("America/New_York");
    }

    @Test
    @DisplayName("logout() should invalidate session via UserSessionRepository")
    void shouldLogoutSuccessfully() {
        authService.logout(new LogoutRequest("refreshTokenToRevoke"));
        verify(sessionRepository).invalidateSessionByRefreshToken("refreshTokenToRevoke");
    }
}
