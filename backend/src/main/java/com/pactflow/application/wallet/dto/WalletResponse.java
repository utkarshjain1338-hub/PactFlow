package com.pactflow.application.wallet.dto;

import com.pactflow.domain.wallet.Wallet;
import com.pactflow.domain.wallet.WalletProvider;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record WalletResponse(
        UUID id,
        String stellarPublicKey,
        WalletProvider provider,
        boolean isPrimary,
        boolean isVerified,
        Instant verifiedAt,
        Instant createdAt
) {
    /**
     * Converts a Wallet domain entity to a WalletResponse DTO.
     *
     * @param wallet the wallet entity
     * @return the wallet response
     */
    public static WalletResponse from(final Wallet wallet) {
        return WalletResponse.builder()
                .id(wallet.getId())
                .stellarPublicKey(wallet.getStellarPublicKey())
                .provider(wallet.getProvider())
                .isPrimary(wallet.isPrimary())
                .isVerified(wallet.isVerified())
                .verifiedAt(wallet.getVerifiedAt())
                .createdAt(wallet.getCreatedAt())
                .build();
    }
}
