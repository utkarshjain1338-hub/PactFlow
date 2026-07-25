package com.pactflow.domain.wallet;

import com.pactflow.domain.shared.AuditableEntity;
import com.pactflow.domain.shared.SoftDeletable;
import lombok.*;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Wallet domain aggregate representing a user's verified or unverified Stellar wallet.
 */
@Getter
@Setter
public class Wallet extends AuditableEntity implements SoftDeletable {

    private final UUID userId;
    private final String stellarPublicKey;
    private final WalletProvider provider;
    private boolean isPrimary;
    private Instant verifiedAt;
    private boolean isDeleted;
    private Instant deletedAt;

    /**
     * Constructs a new Wallet aggregate for initial creation.
     */
    public Wallet(final UUID id, final UUID userId, final String stellarPublicKey, final WalletProvider provider) {
        super(id);
        this.userId = Objects.requireNonNull(userId, "userId must not be null");
        this.stellarPublicKey = Objects.requireNonNull(stellarPublicKey, "stellarPublicKey must not be null");
        this.provider = Objects.requireNonNull(provider, "provider must not be null");
        this.isPrimary = false;
        this.isDeleted = false;
    }

    /**
     * Reconstructs an existing Wallet aggregate from persistence.
     */
    public Wallet(
            final UUID id,
            final Instant createdAt,
            final Instant updatedAt,
            final long version,
            final UUID userId,
            final String stellarPublicKey,
            final WalletProvider provider,
            final boolean isPrimary,
            final Instant verifiedAt,
            final boolean isDeleted,
            final Instant deletedAt) {
        super(id, createdAt, updatedAt, version);
        this.userId = userId;
        this.stellarPublicKey = stellarPublicKey;
        this.provider = provider;
        this.isPrimary = isPrimary;
        this.verifiedAt = verifiedAt;
        this.isDeleted = isDeleted;
        this.deletedAt = deletedAt;
    }

    /**
     * Verifies the wallet.
     */
    public void verify() {
        if (this.verifiedAt == null) {
            this.verifiedAt = Instant.now();
            touch();
        }
    }

    /**
     * Sets whether the wallet is the primary one.
     * @param primary true if primary
     */
    public void setPrimary(final boolean primary) {
        if (this.isPrimary != primary) {
            this.isPrimary = primary;
            touch();
        }
    }

    /**
     * Soft deletes the wallet.
     */
    public void softDelete() {
        if (!this.isDeleted) {
            this.isDeleted = true;
            this.isPrimary = false; // A deleted wallet cannot be primary
            touch();
        }
    }

    public boolean isVerified() {
        return this.verifiedAt != null;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getStellarPublicKey() {
        return stellarPublicKey;
    }

    public WalletProvider getProvider() {
        return provider;
    }

    public boolean isPrimary() {
        return isPrimary;
    }

    public Instant getVerifiedAt() {
        return verifiedAt;
    }

    public boolean isDeleted() {
        return isDeleted;
    }
}
