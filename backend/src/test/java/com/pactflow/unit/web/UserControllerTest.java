package com.pactflow.unit.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pactflow.application.auth.dto.MessageResponse;
import com.pactflow.application.auth.dto.UserSummaryDto;
import com.pactflow.application.user.ProfileService;
import com.pactflow.application.user.dto.ProfileResponse;
import com.pactflow.application.user.dto.PublicProfileResponse;
import com.pactflow.application.user.dto.UpdateProfileRequest;
import com.pactflow.application.user.exception.ActiveMilestonesPreventErasureException;
import com.pactflow.domain.user.AccountType;
import com.pactflow.infrastructure.web.controller.UserController;
import com.pactflow.infrastructure.web.exception.GlobalExceptionHandler;
import com.pactflow.infrastructure.web.security.JwtAuthenticationFilter;
import com.pactflow.infrastructure.web.security.RateLimitFilter;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = UserController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@DisplayName("UserController WebMvc unit tests")
@WithMockUser
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProfileService profileService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private RateLimitFilter rateLimitFilter;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        final UserSummaryDto principal = UserSummaryDto.builder()
                .id(userId)
                .email("test@pactflow.io")
                .accountType(AccountType.FREELANCER)
                .displayName("Test User")
                .build();

        final UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal, null, List.of(new SimpleGrantedAuthority("ROLE_FREELANCER")));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("PATCH /api/v1/users/me should return 200 OK with updated profile")
    void shouldUpdateProfile() throws Exception {
        final UpdateProfileRequest request = UpdateProfileRequest.builder()
                .displayName("Updated Name")
                .timezone("America/New_York")
                .build();

        final ProfileResponse response = ProfileResponse.builder()
                .id(userId)
                .email("test@pactflow.io")
                .displayName("Updated Name")
                .timezone("America/New_York")
                .accountType(AccountType.FREELANCER)
                .isEmailVerified(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(profileService.updateProfile(eq(userId), any(UpdateProfileRequest.class))).thenReturn(response);

        mockMvc.perform(patch("/api/v1/users/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Updated Name"))
                .andExpect(jsonPath("$.timezone").value("America/New_York"));
    }

    @Test
    @DisplayName("PATCH /api/v1/users/me should return 422 Unprocessable Entity on validation failure (display name & avatar)")
    void shouldReturn422OnInvalidProfileRequest() throws Exception {
        final UpdateProfileRequest request = UpdateProfileRequest.builder()
                .displayName("X") // min size is 2
                .avatarUrl("ftp://bad.url/image.png") // must be HTTPS
                .build();

        mockMvc.perform(patch("/api/v1/users/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.title").value("Validation Failed"));
    }

    @Test
    @DisplayName("PATCH /api/v1/users/me should return 422 on oversized bio and invalid timezone")
    void shouldReturn422OnOversizedBioAndTimezone() throws Exception {
        final String largeBio = "A".repeat(1001); // max size is 1000
        final String largeTimezone = "A".repeat(51); // max size is 50

        final UpdateProfileRequest request = UpdateProfileRequest.builder()
                .bio(largeBio)
                .timezone(largeTimezone)
                .build();

        mockMvc.perform(patch("/api/v1/users/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.title").value("Validation Failed"));
    }

    @Test
    @DisplayName("DELETE /api/v1/users/me should return 202 Accepted when no active milestones exist")
    void shouldRequestAccountErasure() throws Exception {
        final MessageResponse response = new MessageResponse(
                "Account deletion scheduled. You will be logged out and your data will be anonymised within 30 days.");
        when(profileService.requestAccountErasure(userId)).thenReturn(response);

        mockMvc.perform(delete("/api/v1/users/me"))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.message").value("Account deletion scheduled. You will be logged out and your data will be anonymised within 30 days."));
    }

    @Test
    @DisplayName("DELETE /api/v1/users/me should return 409 Conflict when active milestones exist")
    void shouldReturn409WhenActiveMilestonesExist() throws Exception {
        when(profileService.requestAccountErasure(userId))
                .thenThrow(new ActiveMilestonesPreventErasureException());

        mockMvc.perform(delete("/api/v1/users/me"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.type").value("https://api.pactflow.io/errors/ACTIVE_MILESTONES_PREVENT_ERASURE"))
                .andExpect(jsonPath("$.detail").value("Active escrows prevent deletion"));
    }

    @Test
    @DisplayName("GET /api/v1/users/{id}/profile should return 200 OK with safe public profile")
    void shouldGetPublicProfile() throws Exception {
        final UUID targetId = UUID.randomUUID();
        final PublicProfileResponse response = PublicProfileResponse.builder()
                .id(targetId)
                .displayName("Public Developer")
                .bio("Soroban auditor")
                .accountType(AccountType.FREELANCER)
                .createdAt(Instant.now())
                .build();

        when(profileService.getPublicProfile(targetId)).thenReturn(response);

        mockMvc.perform(get("/api/v1/users/" + targetId + "/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Public Developer"))
                .andExpect(jsonPath("$.bio").value("Soroban auditor"));
    }

    @Test
    @DisplayName("GET /api/v1/users/me should return 200 OK with current user profile")
    void shouldGetMyProfile() throws Exception {
        final ProfileResponse response = ProfileResponse.builder()
                .id(userId)
                .email("test@pactflow.io")
                .displayName("Test User")
                .accountType(AccountType.FREELANCER)
                .isEmailVerified(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
                
        when(profileService.getMyProfile(userId)).thenReturn(response);

        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.email").value("test@pactflow.io"))
                .andExpect(jsonPath("$.displayName").value("Test User"));
    }

    @Test
    @DisplayName("GET /api/v1/users/me should return 404 Not Found for soft-deleted user")
    void shouldReturn404ForDeletedUser() throws Exception {
        when(profileService.getMyProfile(userId))
                .thenThrow(new com.pactflow.infrastructure.web.exception.EntityNotFoundException("User not found"));

        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.type").value("https://api.pactflow.io/errors/NOT_FOUND"));
    }
}
