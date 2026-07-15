package com.pactflow.application.user.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for PATCH /api/v1/users/me.
 *
 * <p>Authority: API_SPECIFICATION.md Domain 2 (User Profile Management),
 * SECURITY_THREAT_MODEL.md §5.2 (Mass Assignment / Over-posting AZ-05).
 *
 * <p>Strictly allowlists only modifiable profile fields (`displayName`, `avatarUrl`,
 * `timezone`, `bio`). Immutable/security-sensitive fields (`email`, `password`, `accountType`,
 * `isActive`, `version`, `id`) are completely absent and ignored if passed.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UpdateProfileRequest {

    @Size(min = 2, max = 100, message = "Display name must be between 2 and 100 characters.")
    private String displayName;

    @Size(max = 2048, message = "Avatar URL must not exceed 2048 characters.")
    @Pattern(regexp = "^(https://.*)?$", message = "Avatar URL must be a valid HTTPS URL.")
    private String avatarUrl;

    @Size(max = 50, message = "Timezone must not exceed 50 characters.")
    private String timezone;

    @Size(max = 1000, message = "Bio must not exceed 1000 characters.")
    private String bio;
}
