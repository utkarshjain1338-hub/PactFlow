package com.pactflow.application.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;

/**
 * Request DTO for updating password while logged in.
 */
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public record UpdatePasswordRequest(
        @NotBlank(message = "Current password is required")
        String currentPassword,

        @NotBlank(message = "New password is required")
        @Size(min = 10, message = "Password must be at least 10 characters")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).+$",
                message = "Password must contain at least one uppercase letter, one lowercase letter, "
                        + "one digit, and one special character"
        )
        String newPassword
) {}
