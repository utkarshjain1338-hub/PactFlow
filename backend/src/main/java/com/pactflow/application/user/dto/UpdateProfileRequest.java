package com.pactflow.application.user.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;

/**
 * Request DTO for PATCH /api/v1/users/me.
 * Strictly allowlists only modifiable profile fields.
 */
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public record UpdateProfileRequest(
        @Size(min = 2, max = 100, message = "Display name must be between 2 and 100 characters.")
        String displayName,

        @Size(max = 2048, message = "Avatar URL must not exceed 2048 characters.")
        @Pattern(regexp = "^(https://.*)?$", message = "Avatar URL must be a valid HTTPS URL.")
        String avatarUrl,

        @Size(max = 50, message = "Timezone must not exceed 50 characters.")
        String timezone,

        @Size(max = 1000, message = "Bio must not exceed 1000 characters.")
        String bio
) {}
