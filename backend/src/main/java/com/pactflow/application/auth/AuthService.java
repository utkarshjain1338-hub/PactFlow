package com.pactflow.application.auth;

import com.pactflow.application.auth.dto.*;
import com.pactflow.domain.user.Email;
import com.pactflow.domain.user.User;
import com.pactflow.domain.user.UserRepository;
import com.pactflow.infrastructure.config.PactFlowProperties;
import com.pactflow.infrastructure.mail.EmailService;
import com.pactflow.infrastructure.persistence.UserSessionRepository;
import com.pactflow.infrastructure.persistence.entity.UserSessionEntity;
import com.pactflow.infrastructure.web.exception.*;
import com.pactflow.infrastructure.web.security.JwtService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

/**
 * Application service orchestrating identity management, session rotation, and security enforcements.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger LOG = LoggerFactory.getLogger(AuthService.class);

    private static final String REDIS_VERIFY_PREFIX = "auth:verify:";
    private static final String REDIS_RESET_PREFIX = "auth:reset:";
    private static final String REDIS_RESET_USER_PREFIX = "auth:reset:user:";
    private static final String REDIS_LOGIN_ATTEMPTS_PREFIX = "auth:login:attempts:";
    private static final String REDIS_LOGIN_LOCKOUT_PREFIX = "auth:login:lockout:";

    private final UserRepository userRepository;
    private final UserSessionRepository sessionRepository;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate redisTemplate;
    private final PactFlowProperties properties;
    private final SecureRandom secureRandom = new SecureRandom();

    private String timingSafeDummyHash;

    @PostConstruct
    public void init() {
        this.timingSafeDummyHash = passwordEncoder.encode("TimingSafeDummyPassword123!");
    }

    @Transactional
    public RegisterResponse register(final RegisterRequest request, final String ipAddress, final String userAgent) {
        LOG.info("Processing user registration attempt for email: {}", request.email());
        final Email email = new Email(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("An account with this email address already exists.");
        }

        final User saved = userRepository.save(new User(
                UUID.randomUUID(), email, passwordEncoder.encode(request.password()),
                request.accountType(), request.displayName(), request.timezone()
        ));

        final String verificationToken = generateRandomToken();
        redisTemplate.opsForValue().set(
                REDIS_VERIFY_PREFIX + verificationToken, saved.getId().toString(), Duration.ofHours(24));
        emailService.sendVerificationEmail(saved.getEmail().getValue(), saved.getDisplayName(), verificationToken);

        return RegisterResponse.from(saved);
    }

    @Transactional
    public AuthResponse login(final LoginRequest request, final String ipAddress, final String userAgent) {
        final Email email = new Email(request.email());
        final String normalizedEmail = email.getValue();

        if (redisTemplate.opsForValue().get(REDIS_LOGIN_LOCKOUT_PREFIX + normalizedEmail) != null) {
            throw new AccountLockedException("Account locked due to too many failed login attempts. Please try again later.");
        }

        final Optional<User> optUser = userRepository.findByEmail(email);
        if (optUser.isEmpty() || !passwordEncoder.matches(request.password(), optUser.get().getPasswordHash())) {
            if (optUser.isEmpty()) {
                passwordEncoder.matches(request.password(), timingSafeDummyHash);
            }
            recordFailedLoginAttempt(normalizedEmail);
            throw new InvalidCredentialsException("Invalid email or password.");
        }

        final User user = optUser.get();
        redisTemplate.delete(REDIS_LOGIN_ATTEMPTS_PREFIX + normalizedEmail);
        checkAccountActive(user);

        final UserSessionEntity session = sessionRepository.createSession(
                user.getId(), "temporary-pre-jwt", jwtService.generateRefreshToken(),
                ipAddress, userAgent, Instant.now().plus(properties.getSecurity().getJwt().getRefreshTokenTtl())
        );
        return rotateAndBuildAuthResponse(user, session);
    }

    @Transactional
    public AuthResponse refresh(final RefreshTokenRequest request, final String ipAddress, final String userAgent) {
        final UserSessionEntity oldSession = sessionRepository.findByRefreshToken(request.refreshToken())
                .orElseThrow(() -> new TokenReplayException("Invalid or replayed refresh token. Session invalidated."));

        if (oldSession.getExpiresAt().isBefore(Instant.now())) {
            sessionRepository.invalidateSessionByRefreshToken(request.refreshToken());
            throw new TokenExpiredException("Refresh token has expired. Please log in again.");
        }

        final User user = userRepository.findById(oldSession.getUserId())
                .orElseThrow(() -> new AccountDeactivatedException("Account associated with this session no longer exists."));

        if (!user.isActive() || user.isDeleted()) {
            sessionRepository.invalidateSessionByRefreshToken(request.refreshToken());
            throw new AccountDeactivatedException("Your account has been deactivated.");
        }

        return rotateAndBuildAuthResponse(user, oldSession);
    }

    @Transactional
    public void logout(final LogoutRequest request) {
        sessionRepository.invalidateSessionByRefreshToken(request.refreshToken());
    }

    @Transactional
    public MessageResponse verifyEmail(final VerifyEmailRequest request) {
        final String key = REDIS_VERIFY_PREFIX + request.token();
        final String userIdStr = redisTemplate.opsForValue().get(key);
        if (userIdStr == null) {
            throw new TokenExpiredException("Verification token is invalid, expired, or has already been used.");
        }
        redisTemplate.delete(key);
        final User user = findUserOrThrow(UUID.fromString(userIdStr));
        user.verifyEmail();
        userRepository.save(user);
        return new MessageResponse("Email successfully verified.");
    }

    @Transactional
    public MessageResponse forgotPassword(final ForgotPasswordRequest request) {
        final Email email = new Email(request.email());
        userRepository.findByEmail(email).ifPresent(user -> {
            if (user.isActive() && !user.isDeleted()) {
                final String existingKey = REDIS_RESET_USER_PREFIX + user.getId();
                final String oldToken = redisTemplate.opsForValue().get(existingKey);
                if (oldToken != null) {
                    redisTemplate.delete(REDIS_RESET_PREFIX + oldToken);
                }
                final String resetToken = generateRandomToken();
                redisTemplate.opsForValue().set(REDIS_RESET_PREFIX + resetToken, user.getId().toString(), Duration.ofHours(1));
                redisTemplate.opsForValue().set(existingKey, resetToken, Duration.ofHours(1));
                emailService.sendPasswordResetEmail(user.getEmail().getValue(), user.getDisplayName(), resetToken);
            }
        });
        return new MessageResponse("If that email is registered, a password reset link will be sent shortly.");
    }

    @Transactional
    public MessageResponse resetPassword(final ResetPasswordRequest request) {
        final String key = REDIS_RESET_PREFIX + request.token();
        final String userIdStr = redisTemplate.opsForValue().get(key);
        if (userIdStr == null) {
            throw new TokenExpiredException("Password reset token is invalid, expired, or has already been used.");
        }
        final UUID userId = UUID.fromString(userIdStr);
        final User user = findUserOrThrow(userId);
        redisTemplate.delete(key);
        redisTemplate.delete(REDIS_RESET_USER_PREFIX + userId);
        user.changePassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        sessionRepository.invalidateAllSessionsForUser(userId);
        return new MessageResponse("Password successfully reset. Please log in with your new credentials.");
    }

    @Transactional(readOnly = true)
    public UserMeResponse getMe(final UUID userId) {
        final User user = findUserOrThrow(userId);
        checkAccountActive(user);
        return UserMeResponse.from(user);
    }

    private AuthResponse rotateAndBuildAuthResponse(final User user, final UserSessionEntity session) {
        final Instant expiresAt = Instant.now().plus(properties.getSecurity().getJwt().getRefreshTokenTtl());
        final String rawRefreshToken = jwtService.generateRefreshToken();
        final String accessToken = jwtService.generateAccessToken(user, session.getId());
        sessionRepository.rotateSession(session, accessToken, rawRefreshToken, expiresAt);
        LOG.info("Issued tokens for user {} [session={}]", user.getId(), session.getId());
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .expiresIn(properties.getSecurity().getJwt().getAccessTokenTtl().getSeconds())
                .user(UserSummaryDto.from(user))
                .build();
    }

    private void checkAccountActive(final User user) {
        if (!user.isActive() || user.isDeleted()) {
            throw new AccountDeactivatedException("Your account has been deactivated or deleted.");
        }
    }

    private void recordFailedLoginAttempt(final String email) {
        final String attemptsKey = REDIS_LOGIN_ATTEMPTS_PREFIX + email;
        final Long attempts = redisTemplate.opsForValue().increment(attemptsKey);
        if (attempts != null && attempts == 1L) {
            redisTemplate.expire(attemptsKey, Duration.ofMinutes(15));
        }
        if (attempts != null && attempts >= 10L) {
            LOG.warn("Locking account {} due to {} consecutive failed login attempts", email, attempts);
            redisTemplate.opsForValue().set(REDIS_LOGIN_LOCKOUT_PREFIX + email, "LOCKED", Duration.ofMinutes(15));
            redisTemplate.delete(attemptsKey);
        }
    }

    private String generateRandomToken() {
        final byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private User findUserOrThrow(final UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", userId));
    }
}
