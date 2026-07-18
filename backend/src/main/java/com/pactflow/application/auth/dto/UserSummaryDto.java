package com.pactflow.application.auth.dto;

import com.pactflow.domain.user.AccountType;
import com.pactflow.domain.user.User;
import lombok.Builder;

import java.util.UUID;

/**
 * Summary DTO of authenticated user embedded in login and refresh responses.
 */
@Builder
public record UserSummaryDto(
        UUID id,
        String email,
        AccountType accountType,
        String displayName
) {
    /**
     * Converts a User domain entity to a UserSummaryDto.
     *
     * @param user domain entity
     * @return summary DTO
     */
    public static UserSummaryDto from(final User user) {
        return new UserSummaryDto(
                user.getId(),
                user.getEmail().getValue(),
                user.getAccountType(),
                user.getDisplayName()
        );
    }
}
