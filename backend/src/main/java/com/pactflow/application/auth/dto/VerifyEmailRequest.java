package com.pactflow.application.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

/**
 * Request DTO for email verification token consumption.
 */
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public record VerifyEmailRequest(
        @NotBlank(message = "Verification token is required") String token
) {}
