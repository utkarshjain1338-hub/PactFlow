package com.pactflow.application.project.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class LinkWalletRequest {
    @NotNull(message = "Wallet ID is required")
    private UUID walletId;
}
