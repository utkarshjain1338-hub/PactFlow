package com.pactflow.application.wallet.dto;

import com.pactflow.domain.wallet.WalletProvider;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.pactflow.application.wallet.validation.ValidStellarPublicKey;

public record AddWalletRequest(
        @NotBlank(message = "Stellar public key is required")
        @Size(min = 56, max = 56, message = "Stellar public key must be exactly 56 characters")
        @ValidStellarPublicKey
        String stellarPublicKey,

        @NotNull(message = "Wallet provider is required")
        WalletProvider provider
) {}
