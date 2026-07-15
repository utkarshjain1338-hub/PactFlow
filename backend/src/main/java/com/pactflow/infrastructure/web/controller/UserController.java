package com.pactflow.infrastructure.web.controller;

import com.pactflow.application.auth.dto.MessageResponse;
import com.pactflow.application.auth.dto.UserSummaryDto;
import com.pactflow.application.user.GetPublicProfileUseCase;
import com.pactflow.application.user.RequestAccountErasureUseCase;
import com.pactflow.application.user.UpdateProfileUseCase;
import com.pactflow.application.user.dto.ProfileResponse;
import com.pactflow.application.user.dto.PublicProfileResponse;
import com.pactflow.application.user.dto.UpdateProfileRequest;
import com.pactflow.domain.user.User;
import com.pactflow.domain.user.UserRepository;
import com.pactflow.infrastructure.web.exception.AuthorizationException;
import com.pactflow.infrastructure.web.exception.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * REST controller for User Profile management and account erasure endpoints.
 *
 * <p>Authority: API_SPECIFICATION.md Domain 2 (`PATCH /users/me`, `DELETE /users/me`, `GET /users/{id}/profile`).
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UpdateProfileUseCase updateProfileUseCase;
    private final RequestAccountErasureUseCase requestAccountErasureUseCase;
    private final GetPublicProfileUseCase getPublicProfileUseCase;
    private final UserRepository userRepository;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponse> getMyProfile(@AuthenticationPrincipal final Object principal) {
        final UUID userId = extractUserIdFromPrincipal(principal);
        final User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        return ResponseEntity.ok(ProfileResponse.from(user));
    }

    @PatchMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponse> updateProfile(
            @AuthenticationPrincipal final Object principal,
            @Valid @RequestBody final UpdateProfileRequest request) {
        final UUID userId = extractUserIdFromPrincipal(principal);
        final ProfileResponse response = updateProfileUseCase.updateProfile(userId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> requestAccountErasure(@AuthenticationPrincipal final Object principal) {
        final UUID userId = extractUserIdFromPrincipal(principal);
        final MessageResponse response = requestAccountErasureUseCase.requestAccountErasure(userId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @GetMapping("/{id}/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PublicProfileResponse> getPublicProfile(@PathVariable("id") final UUID id) {
        final PublicProfileResponse response = getPublicProfileUseCase.getPublicProfile(id);
        return ResponseEntity.ok(response);
    }

    private UUID extractUserIdFromPrincipal(final Object principal) {
        if (principal instanceof UUID uuid) {
            return uuid;
        } else if (principal instanceof UserSummaryDto summary) {
            return summary.getId();
        } else if (principal instanceof String str) {
            try {
                return UUID.fromString(str);
            } catch (final IllegalArgumentException e) {
                // fall through
            }
        }
        throw new AuthorizationException("Valid user authentication principal is required.");
    }
}
