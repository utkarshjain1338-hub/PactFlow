package com.pactflow.application.auth.dto;

import com.pactflow.domain.user.AccountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Summary DTO of authenticated user embedded in login and refresh responses.
 * Authority: API_SPECIFICATION.md §POST /auth/login.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDto {
    private UUID id;
    private String email;
    private AccountType accountType;
    private String displayName;
}
