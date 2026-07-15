package com.pactflow.application.auth;

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
import com.pactflow.domain.user.Email;
import com.pactflow.domain.user.User;
import com.pactflow.domain.user.UserRepository;
import com.pactflow.infrastructure.config.PactFlowProperties;
import com.pactflow.infrastructure.mail.EmailService;
import com.pactflow.infrastructure.persistence.UserSessionRepository;
import com.pactflow.infrastructure.persistence.entity.UserSessionEntity;
import com.pactflow.infrastructure.web.exception.AccountDeactivatedException;
import com.pactflow.infrastructure.web.exception.AccountLockedException;
import com.pactflow.infrastructure.web.exception.DuplicateResourceException;
import com.pactflow.infrastructure.web.exception.EntityNotFoundException;
import com.pactflow.infrastructure.web.exception.InvalidCredentialsException;
import com.pactflow.infrastructure.web.exception.TokenExpiredException;
import com.pactflow.infrastructure.web.exception.TokenReplayException;
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
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

/**
 * Application service orchestrating identity management, session rotation, and security enforcements.
 *
 * <p>Authority: API_SPECIFICATION.md Domain 1, SECURITY_THREAT_MODEL.md §4 (Auth Threat Mitigations).
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

    /**
     * Initializes precomputed hashes required for timing-safe operations.
     */
    @PostConstruct
    public void init() {
        // Precompute a dummy Argon2id hash at startup for timing-safe login checks (AT-10)
        this.timingSafeDummyHash = passwordEncoder.encode("TimingSafeDummyPassword123!");
    }

    /**
     * Registers a new user account with initial validation and verification email dispatch.
     *
     * @param request   registration request attributes
     * @param ipAddress client IP address
     * @param userAgent client User-Agent string
     * @return summary response with initial account status
     */
    @Transactional
    public RegisterResponse register(final RegisterRequest request, final String ipAddress, final String userAgent) {
        LOG.info("Processing user registration attempt for email: {}", request.getEmail());
        final Email email = new Email(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            LOG.warn("Registration rejected: email {} is already registered", email.getValue());
            throw new DuplicateResourceException("An account with this email address already exists.");
        }

        final String passwordHash = passwordEncoder.encode(request.getPassword());
        final User user = new User(
                UUID.randomUUID(),
                email,
                passwordHash,
                request.getAccountType(),
                request.getDisplayName(),
                request.getTimezone()
        );

        final User saved = userRepository.save(user);

        // Generate verification token (24-hour expiry)
        final String verificationToken = generateRandomToken();
        redisTemplate.opsForValue().set(
                REDIS_VERIFY_PREFIX + verificationToken,
                saved.getId().toString(),
                Duration.ofHours(24)
        );

        emailService.sendVerificationEmail(saved.getEmail().getValue(), saved.getDisplayName(), verificationToken);

        return RegisterResponse.builder()
                .id(saved.getId())
                .email(saved.getEmail().getValue())
                .accountType(saved.getAccountType())
                .displayName(saved.getDisplayName())
                .isEmailVerified(saved.isEmailVerified())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    /**
     * Authenticates user credentials and issues stateless access and refresh tokens.
     *
     * @param request   login email and password
     * @param ipAddress client IP address
     * @param userAgent client User-Agent string
     * @return authentication response containing tokens and user summary
     */
    @Transactional
    public AuthResponse login(final LoginRequest request, final String ipAddress, final String userAgent) {
        final Email email = new Email(request.getEmail());
        final String normalizedEmail = email.getValue();

        // AT-01 / AT-02: Check account lockout status
        final String lockoutKey = REDIS_LOGIN_LOCKOUT_PREFIX + normalizedEmail;
        final String lockout = redisTemplate.opsForValue().get(lockoutKey);
        if (lockout != null) {
            LOG.warn("Login attempt blocked for locked account: {}", normalizedEmail);
            throw new AccountLockedException("Account locked due to too many failed login attempts. "
                    + "Please try again later.");
        }

        final Optional<User> optUser = userRepository.findByEmail(email);

        // AT-10: Timing-safe verification against dummy Argon2 hash if user does not exist
        if (optUser.isEmpty()) {
            passwordEncoder.matches(request.getPassword(), timingSafeDummyHash);
            LOG.warn("Login failed: user not found for email {}", normalizedEmail);
            throw new InvalidCredentialsException("Invalid email or password.");
        }

        final User user = optUser.get();
        final boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());

        if (!passwordMatches) {
            recordFailedLoginAttempt(normalizedEmail);
            LOG.warn("Login failed: incorrect password for user {}", normalizedEmail);
            throw new InvalidCredentialsException("Invalid email or password.");
        }

        // Clear failed login attempts on successful password verification
        redisTemplate.delete(REDIS_LOGIN_ATTEMPTS_PREFIX + normalizedEmail);

        if (!user.isActive() || user.isDeleted()) {
            LOG.warn("Login blocked: account is deactivated or deleted for user {}", normalizedEmail);
            throw new AccountDeactivatedException("Your account has been deactivated or deleted.");
        }

        // Create new session
        final Instant expiresAt = Instant.now().plus(properties.getSecurity().getJwt().getRefreshTokenTtl());
        final String rawRefreshToken = jwtService.generateRefreshToken();
        final UserSessionEntity session = sessionRepository.createSession(
                user.getId(),
                "temporary-pre-jwt", // will be rotated immediately below or generated right now
                rawRefreshToken,
                ipAddress,
                userAgent,
                expiresAt
        );

        // Now generate signed access token using the newly generated session ID
        final String accessToken = jwtService.generateAccessToken(user, session.getId());
        session.setTokenHash(sessionRepository.sha256(accessToken));
        sessionRepository.rotateSession(session, accessToken, rawRefreshToken, expiresAt);

        LOG.info("User {} successfully logged in [session={}]", user.getId(), session.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .tokenType("Bearer")
                .expiresIn(properties.getSecurity().getJwt().getAccessTokenTtl().getSeconds())
                .user(UserSummaryDto.builder()
                        .id(user.getId())
                        .email(user.getEmail().getValue())
                        .accountType(user.getAccountType())
                        .displayName(user.getDisplayName())
                        .build())
                .build();
    }

    /**
     * Rotates session refresh tokens and issues a new access token.
     *
     * @param request   refresh token request
     * @param ipAddress client IP address
     * @param userAgent client User-Agent string
     * @return rotated authentication response
     */
    @Transactional
    public AuthResponse refresh(final RefreshTokenRequest request, final String ipAddress, final String userAgent) {
        final Optional<UserSessionEntity> optSession = sessionRepository.findByRefreshToken(request.getRefreshToken());

        if (optSession.isEmpty()) {
            LOG.warn("Token refresh failed: token hash not found in user_sessions (potential replay attempt AT-05)");
            throw new TokenReplayException("Invalid or replayed refresh token. Session invalidated.");
        }

        final UserSessionEntity oldSession = optSession.get();
        if (oldSession.getExpiresAt().isBefore(Instant.now())) {
            LOG.warn("Token refresh failed: session {} has expired", oldSession.getId());
            sessionRepository.invalidateSessionByRefreshToken(request.getRefreshToken());
            throw new TokenExpiredException("Refresh token has expired. Please log in again.");
        }

        final User user = userRepository.findById(oldSession.getUserId())
                .orElseThrow(() -> new AccountDeactivatedException(
                        "Account associated with this session no longer exists."));

        if (!user.isActive() || user.isDeleted()) {
            sessionRepository.invalidateSessionByRefreshToken(request.getRefreshToken());
            throw new AccountDeactivatedException("Your account has been deactivated.");
        }

        final Instant newExpiresAt = Instant.now().plus(properties.getSecurity().getJwt().getRefreshTokenTtl());
        final String newRefreshToken = jwtService.generateRefreshToken();
        final String newAccessToken = jwtService.generateAccessToken(user, oldSession.getId());

        sessionRepository.rotateSession(oldSession, newAccessToken, newRefreshToken, newExpiresAt);

        LOG.info("Rotated tokens for user {} [session={}]", user.getId(), oldSession.getId());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(properties.getSecurity().getJwt().getAccessTokenTtl().getSeconds())
                .user(UserSummaryDto.builder()
                        .id(user.getId())
                        .email(user.getEmail().getValue())
                        .accountType(user.getAccountType())
                        .displayName(user.getDisplayName())
                        .build())
                .build();
    }

    /**
     * Invalidates a user session upon logout.
     *
     * @param request logout request containing refresh token
     */
    @Transactional
    public void logout(final LogoutRequest request) {
        LOG.info("Processing user logout request");
        sessionRepository.invalidateSessionByRefreshToken(request.getRefreshToken());
    }

    /**
     * Consumes a verification token to mark an email address as verified.
     *
     * @param request verification request containing token
     * @return confirmation message
     */
    @Transactional
    public MessageResponse verifyEmail(final VerifyEmailRequest request) {
        final String key = REDIS_VERIFY_PREFIX + request.getToken();
        final String userIdStr = redisTemplate.opsForValue().get(key);

        if (userIdStr == null) {
            LOG.warn("Email verification failed: token not found or expired");
            throw new TokenExpiredException("Verification token is invalid, expired, or has already been used.");
        }

        // Single-use atomicity: delete token immediately
        redisTemplate.delete(key);

        final UUID userId = UUID.fromString(userIdStr);
        final User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", userId));

        user.verifyEmail();
        userRepository.save(user);

        LOG.info("Successfully verified email for user {}", userId);
        return new MessageResponse("Email successfully verified.");
    }

    /**
     * Initiates the password reset flow by dispatching a single-use token if the account exists.
     *
     * @param request forgot password request containing email
     * @return generic status response regardless of email existence (AT-12)
     */
    @Transactional
    public MessageResponse forgotPassword(final ForgotPasswordRequest request) {
        final Email email = new Email(request.getEmail());
        final Optional<User> optUser = userRepository.findByEmail(email);

        // AT-12: Always return success response regardless of email existence to prevent user enumeration
        if (optUser.isPresent() && optUser.get().isActive() && !optUser.get().isDeleted()) {
            final User user = optUser.get();

            // AT-13: Invalidate previous reset token if one exists
            final String existingTokenKey = REDIS_RESET_USER_PREFIX + user.getId();
            final String oldToken = redisTemplate.opsForValue().get(existingTokenKey);
            if (oldToken != null) {
                redisTemplate.delete(REDIS_RESET_PREFIX + oldToken);
            }

            final String resetToken = generateRandomToken();
            redisTemplate.opsForValue().set(
                    REDIS_RESET_PREFIX + resetToken, user.getId().toString(), Duration.ofHours(1));
            redisTemplate.opsForValue().set(existingTokenKey, resetToken, Duration.ofHours(1));

            emailService.sendPasswordResetEmail(user.getEmail().getValue(), user.getDisplayName(), resetToken);
            LOG.info("Initiated password reset flow for user {}", user.getId());
        } else {
            LOG.info("Forgot password requested for non-existent or inactive email: {}", email.getValue());
        }

        return new MessageResponse("If that email is registered, a password reset link will be sent shortly.");
    }

    /**
     * Completes password reset by verifying single-use token and updating the password hash.
     *
     * @param request reset password request containing token and new password
     * @return confirmation message
     */
    @Transactional
    public MessageResponse resetPassword(final ResetPasswordRequest request) {
        final String key = REDIS_RESET_PREFIX + request.getToken();
        final String userIdStr = redisTemplate.opsForValue().get(key);

        if (userIdStr == null) {
            LOG.warn("Password reset failed: token not found or expired");
            throw new TokenExpiredException("Password reset token is invalid, expired, or has already been used.");
        }

        final UUID userId = UUID.fromString(userIdStr);
        final User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", userId));

        // Single-use atomicity: delete both token lookups
        redisTemplate.delete(key);
        redisTemplate.delete(REDIS_RESET_USER_PREFIX + userId);

        final String newHash = passwordEncoder.encode(request.getNewPassword());
        user.changePassword(newHash);
        userRepository.save(user);

        // AT-03 / Security best practice: invalidate all active sessions across devices upon password reset
        sessionRepository.invalidateAllSessionsForUser(userId);

        LOG.info("Successfully reset password and invalidated existing sessions for user {}", userId);
        return new MessageResponse("Password successfully reset. Please log in with your new credentials.");
    }

    /**
     * Retrieves full profile details for the authenticated user.
     *
     * @param userId user UUID from security principal
     * @return profile summary response with wallets list
     */
    @Transactional(readOnly = true)
    public UserMeResponse getMe(final UUID userId) {
        final User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", userId));

        if (!user.isActive()) {
            throw new AccountDeactivatedException("Your account has been deactivated.");
        }

        return UserMeResponse.builder()
                .id(user.getId())
                .email(user.getEmail().getValue())
                .accountType(user.getAccountType())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .timezone(user.getTimezone())
                .bio(user.getBio())
                .isEmailVerified(user.isEmailVerified())
                .isActive(user.isActive())
                .wallets(new ArrayList<>())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
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
}
