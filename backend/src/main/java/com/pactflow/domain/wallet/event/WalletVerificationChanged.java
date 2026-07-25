package com.pactflow.domain.wallet.event;

import com.pactflow.domain.shared.DomainEvent;
import java.time.Instant;
import java.util.UUID;

/**
 * Domain event published when a wallet's verification status changes.
 */
public record WalletVerificationChanged(
        UUID userId,
        UUID walletId,
        boolean isVerified,
        UUID eventId,
        Instant occurredAt
) implements DomainEvent {

    public WalletVerificationChanged(UUID userId, UUID walletId, boolean isVerified) {
        this(userId, walletId, isVerified, UUID.randomUUID(), Instant.now());
    }

    @Override
    public UUID aggregateId() {
        return walletId;
    }

    @Override
    public String eventType() {
        return "WalletVerificationChanged";
    }

    @Override
    public String sourceContext() {
        return "wallet";
    }

    @Override
    public String aggregateType() {
        return "Wallet";
    }
}
