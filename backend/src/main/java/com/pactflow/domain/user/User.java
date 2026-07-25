package com.pactflow.domain.user;

import com.pactflow.domain.shared.AuditableEntity;
import com.pactflow.domain.shared.SoftDeletable;

import java.time.Instant;
import java.util.Objects;
import java.util.Set;
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

    private Email email;
    private String passwordHash;
    private AccountType accountType;
    private Set<AccountType> allowedRoles;
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
        this.allowedRoles = new java.util.HashSet<>(java.util.Collections.singleton(this.accountType));
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
     * @param accountType     active account role
     * @param allowedRoles    set of roles the user possesses
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
            final Set<AccountType> allowedRoles,
            final String displayName,
            final String avatarUrl,
            final String timezone,
            final String bio,
            final boolean isEmailVerified,
            final boolean isActive,
            final boolean isDeleted,
            final Instant deletedAt) {
        super(id, createdAt, updatedAt, version);
        this.email = email;
        this.passwordHash = passwordHash;
        this.accountType = Objects.requireNonNull(accountType, "accountType must not be null");
        this.allowedRoles = allowedRoles != null ? new java.util.HashSet<>(allowedRoles) : new java.util.HashSet<>(java.util.Collections.singleton(accountType));
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
        this.timezone = timezone != null && !timezone.isBlank() ? timezone : "UTC";
        this.bio = bio;
        this.isEmailVerified = isEmailVerified;
        this.isActive = isActive;
        this.isDeleted = isDeleted;
        this.deletedAt = deletedAt;
    }

    public Set<AccountType> getAllowedRoles() {
        return java.util.Collections.unmodifiableSet(allowedRoles);
    }

    /**
     * Switches the active role context if the user is authorized.
     */
    public void switchActiveRole(AccountType targetRole) {
        if (!allowedRoles.contains(targetRole)) {
            throw new IllegalStateException("User does not possess the requested role.");
        }
        if (this.accountType != targetRole) {
            this.accountType = targetRole;
            touch();
        }
    }

    public void addRole(AccountType newRole) {
        if (newRole != null && allowedRoles.add(newRole)) {
            touch();
        }
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

    /**
     * Updates the user's profile fields.
     *
     * <p>Authority: API_SPECIFICATION.md Domain 2 (PATCH /users/me), DOMAIN_MODEL.md §6.
     *
     * @param displayName new display name (2-100 characters if not null)
     * @param avatarUrl   new avatar URL (valid HTTPS URL up to 2048 characters if not null)
     * @param timezone    new IANA timezone (non-blank up to 50 characters if not null)
     * @param bio         new user biography (up to 1000 characters if not null)
     */
    public void updateProfile(
            final String displayName,
            final String avatarUrl,
            final String timezone,
            final String bio) {
        boolean changed = updateDisplayNameField(displayName);
        if (updateAvatarUrlField(avatarUrl)) {
            changed = true;
        }
        if (updateTimezoneField(timezone)) {
            changed = true;
        }
        if (updateBioField(bio)) {
            changed = true;
        }
        if (changed) {
            touch();
        }
    }

    private boolean updateDisplayNameField(final String displayName) {
        if (displayName == null) {
            return false;
        }
        final String trimmedName = displayName.trim();
        if (trimmedName.length() < 2 || trimmedName.length() > 100) {
            throw new IllegalArgumentException("Display name must be between 2 and 100 characters.");
        }
        if (!Objects.equals(this.displayName, trimmedName)) {
            this.displayName = trimmedName;
            return true;
        }
        return false;
    }

    private boolean updateAvatarUrlField(final String avatarUrl) {
        if (avatarUrl == null) {
            return false;
        }
        final String trimmedUrl = avatarUrl.trim();
        if (!trimmedUrl.isEmpty() && (!trimmedUrl.startsWith("https://") || trimmedUrl.length() > 2048)) {
            throw new IllegalArgumentException("Avatar URL must be a valid HTTPS URL up to 2048 characters.");
        }
        if (!Objects.equals(this.avatarUrl, trimmedUrl)) {
            this.avatarUrl = trimmedUrl.isEmpty() ? null : trimmedUrl;
            return true;
        }
        return false;
    }

    private boolean updateTimezoneField(final String timezone) {
        if (timezone == null) {
            return false;
        }
        final String trimmedZone = timezone.trim();
        if (trimmedZone.isEmpty() || trimmedZone.length() > 50) {
            throw new IllegalArgumentException("Timezone must be a valid non-blank IANA zone.");
        }
        if (!Objects.equals(this.timezone, trimmedZone)) {
            this.timezone = trimmedZone;
            return true;
        }
        return false;
    }

    private boolean updateBioField(final String bio) {
        if (bio == null) {
            return false;
        }
        if (bio.length() > 1000) {
            throw new IllegalArgumentException("Bio must not exceed 1000 characters.");
        }
        if (!Objects.equals(this.bio, bio)) {
            this.bio = bio;
            return true;
        }
        return false;
    }

    /**
     * Anonymizes PII fields per GDPR erasure requirements while preserving entity id.
     *
     * <p>Authority: DOMAIN_MODEL.md §8 (GDPR Erasure), API_SPECIFICATION.md Domain 2.
     */
    public void anonymize() {
        this.email = null;
        this.displayName = null;
        this.avatarUrl = null;
        this.bio = null;
        this.passwordHash = null;
        this.isActive = false;
        if (!this.isDeleted) {
            this.isDeleted = true;
            this.deletedAt = Instant.now();
        }
        touch();
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
