package com.pactflow.application.wallet.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ChallengeRequest(
        @NotNull(message = "Wallet ID is required")
        UUID walletId
) {}
