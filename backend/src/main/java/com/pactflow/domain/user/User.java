package com.pactflow.domain.user;

import com.pactflow.domain.shared.AuditableEntity;
import com.pactflow.domain.shared.SoftDeletable;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * User aggregate root representing a registered identity on PactFlow.
 *
 * <p>Authority: DOMAIN_MODEL.md §2 (Identity Aggregates), API_SPECIFICATION.md Domain 1.
 *
 * <p>Enforces identity rules, account state transitions, and soft-delete mechanics.
 * Pure Java domain aggregate with zero framework dependencies.
 */
public class User extends AuditableEntity implements SoftDeletable {

    private final Email email;
    private String passwordHash;
    private final AccountType accountType;
    private String displayName;
    private String avatarUrl;
    private String timezone;
    private String bio;
    private boolean isEmailVerified;
    private boolean isActive;
    private boolean isDeleted;
    private Instant deletedAt;

    /**
     * Constructs a new User aggregate root for initial registration.
     *
     * @param id           UUID v7 primary key
     * @param email        validated email value object
     * @param passwordHash Argon2id password hash
     * @param accountType  account role (COMPANY or FREELANCER)
     * @param displayName  user display name
     * @param timezone     IANA timezone string
     */
    public User(
            final UUID id,
            final Email email,
            final String passwordHash,
            final AccountType accountType,
            final String displayName,
            final String timezone) {
        super(id);
        this.email = Objects.requireNonNull(email, "email must not be null");
        this.passwordHash = Objects.requireNonNull(passwordHash, "passwordHash must not be null");
        this.accountType = Objects.requireNonNull(accountType, "accountType must not be null");
        this.displayName = Objects.requireNonNull(displayName, "displayName must not be null");
        this.timezone = timezone != null && !timezone.isBlank() ? timezone : "UTC";
        this.isEmailVerified = false;
        this.isActive = true;
        this.isDeleted = false;
        this.deletedAt = null;
    }

    /**
     * Reconstructs an existing User aggregate root from persistence.
     *
     * @param id              UUID primary key
     * @param createdAt       creation instant
     * @param updatedAt       last update instant
     * @param version         optimistic locking version counter
     * @param email           validated email value object
     * @param passwordHash    Argon2id password hash
     * @param accountType     account role
     * @param displayName     display name
     * @param avatarUrl       optional CDN avatar URL
     * @param timezone        IANA timezone
     * @param bio             optional user biography
     * @param isEmailVerified whether email verification has completed
     * @param isActive        whether the account is currently active
     * @param isDeleted       whether the account is soft-deleted
     * @param deletedAt       timestamp when soft-deleted
     */
    public User(
            final UUID id,
            final Instant createdAt,
            final Instant updatedAt,
            final long version,
            final Email email,
            final String passwordHash,
            final AccountType accountType,
            final String displayName,
            final String avatarUrl,
            final String timezone,
            final String bio,
            final boolean isEmailVerified,
            final boolean isActive,
            final boolean isDeleted,
            final Instant deletedAt) {
        super(id, createdAt, updatedAt, version);
        this.email = Objects.requireNonNull(email, "email must not be null");
        this.passwordHash = Objects.requireNonNull(passwordHash, "passwordHash must not be null");
        this.accountType = Objects.requireNonNull(accountType, "accountType must not be null");
        this.displayName = Objects.requireNonNull(displayName, "displayName must not be null");
        this.avatarUrl = avatarUrl;
        this.timezone = timezone != null && !timezone.isBlank() ? timezone : "UTC";
        this.bio = bio;
        this.isEmailVerified = isEmailVerified;
        this.isActive = isActive;
        this.isDeleted = isDeleted;
        this.deletedAt = deletedAt;
    }

    /**
     * Marks the user's email address as verified.
     *
     * <p>Authority: API_SPECIFICATION.md §POST /auth/verify-email.
     */
    public void verifyEmail() {
        if (!this.isEmailVerified) {
            this.isEmailVerified = true;
            touch();
        }
    }

    /**
     * Updates the user's Argon2id password hash.
     *
     * <p>Authority: API_SPECIFICATION.md §POST /auth/reset-password.
     *
     * @param newPasswordHash new Argon2id hash
     */
    public void changePassword(final String newPasswordHash) {
        this.passwordHash = Objects.requireNonNull(newPasswordHash, "newPasswordHash must not be null");
        touch();
    }

    /**
     * Deactivates the user account.
     *
     * <p>Authority: SECURITY_THREAT_MODEL.md §4 (Account Lockout / Deactivation).
     */
    public void deactivate() {
        if (this.isActive) {
            this.isActive = false;
            touch();
        }
    }

    /**
     * Soft-deletes the user account.
     *
     * <p>Authority: DOMAIN_MODEL.md §8 (Soft Delete Rules), API_SPECIFICATION.md Domain 2.
     */
    public void softDelete() {
        if (!this.isDeleted) {
            this.isDeleted = true;
            this.deletedAt = Instant.now();
            this.isActive = false;
            touch();
        }
    }

    public Email getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public AccountType getAccountType() {
        return accountType;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public String getTimezone() {
        return timezone;
    }

    public String getBio() {
        return bio;
    }

    public boolean isEmailVerified() {
        return isEmailVerified;
    }

    public boolean isActive() {
        return isActive;
    }

    @Override
    public boolean isDeleted() {
        return isDeleted;
    }

    @Override
    public Instant getDeletedAt() {
        return deletedAt;
    }
}
