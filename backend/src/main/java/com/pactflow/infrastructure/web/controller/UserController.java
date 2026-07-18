package com.pactflow.infrastructure.web.controller;

import com.pactflow.application.auth.dto.MessageResponse;
import com.pactflow.application.user.ProfileService;
import com.pactflow.application.user.dto.ProfileResponse;
import com.pactflow.application.user.dto.PublicProfileResponse;
import com.pactflow.application.user.dto.UpdateProfileRequest;
import com.pactflow.infrastructure.web.exception.EntityNotFoundException;
import com.pactflow.infrastructure.web.security.PrincipalExtractor;
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

    private final ProfileService profileService;

    /**
     * Retrieves the authenticated user's profile.
     *
     * @param principal authenticated user principal
     * @return 200 OK with profile data
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponse> getMyProfile(@AuthenticationPrincipal final Object principal) {
        final UUID userId = PrincipalExtractor.extractUserId(principal);
        final ProfileResponse response = profileService.getMyProfile(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Updates the authenticated user's profile fields.
     *
     * @param principal authenticated user principal
     * @param request profile update request parameters
     * @return 200 OK with updated profile data
     */
    @PatchMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponse> updateProfile(
            @AuthenticationPrincipal final Object principal,
            @Valid @RequestBody final UpdateProfileRequest request) {
        final UUID userId = PrincipalExtractor.extractUserId(principal);
        final ProfileResponse response = profileService.updateProfile(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Requests account erasure and soft deletion.
     *
     * @param principal authenticated user principal
     * @return 202 Accepted confirming erasure scheduled
     */
    @DeleteMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> requestAccountErasure(@AuthenticationPrincipal final Object principal) {
        final UUID userId = PrincipalExtractor.extractUserId(principal);
        final MessageResponse response = profileService.requestAccountErasure(userId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    /**
     * Retrieves the public profile for a user by ID.
     *
     * @param id target user ID
     * @return 200 OK with public profile data
     */
    @GetMapping("/{id}/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PublicProfileResponse> getPublicProfile(@PathVariable("id") final UUID id) {
        final PublicProfileResponse response = profileService.getPublicProfile(id);
        return ResponseEntity.ok(response);
    }
}
