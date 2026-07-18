package com.pactflow.application.wallet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record VerifyWalletRequest(
        @NotNull(message = "Wallet ID is required")
        UUID walletId,

        @NotBlank(message = "Signature is required")
        String signature
) {}
