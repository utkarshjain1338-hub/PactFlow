package com.pactflow.application.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Summary DTO representing a linked wallet in the GET /auth/me response.
 * Authority: API_SPECIFICATION.md §GET /auth/me.
 *
 * <p>Note: In M1-AUTHENTICATION, the wallets list in UserMeResponse is always empty [].
 * This DTO ensures the exact response contract shape is established for subsequent milestones.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletSummaryDto {
    private UUID id;
    private String stellarPublicKey;
    private String walletProvider;
    private boolean isPrimary;
    private Instant verifiedAt;
}
