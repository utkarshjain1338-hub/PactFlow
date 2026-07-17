package com.pactflow.application.auth.dto;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

/**
 * Summary DTO representing a linked wallet in the GET /auth/me response.
 */
@Builder
public record WalletSummaryDto(
        UUID id,
        String stellarPublicKey,
        String walletProvider,
        boolean isPrimary,
        Instant verifiedAt
) {}
