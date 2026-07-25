package com.pactflow.application.auth.dto;

import com.pactflow.domain.user.AccountType;
import jakarta.validation.constraints.NotNull;

public record SwitchRoleRequest(
        @NotNull(message = "Target role is required.")
        AccountType role
) {}
