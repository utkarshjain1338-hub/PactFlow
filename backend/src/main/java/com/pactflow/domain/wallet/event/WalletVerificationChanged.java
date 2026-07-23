package com.pactflow.domain.wallet.event;

import java.util.UUID;

/**
 * Domain event published when a wallet's verification status changes.
 */
public record WalletVerificationChanged(
        UUID userId,
        UUID walletId,
        boolean isVerified
) {
}
