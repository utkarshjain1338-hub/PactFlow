package com.pactflow.unit.application.user;

import com.pactflow.application.auth.dto.MessageResponse;
import com.pactflow.application.user.ProfileService;
import com.pactflow.application.user.dto.ProfileResponse;
import com.pactflow.application.user.dto.PublicProfileResponse;
import com.pactflow.application.user.dto.UpdateProfileRequest;
import com.pactflow.application.user.exception.ActiveMilestonesPreventErasureException;
import com.pactflow.domain.shared.DomainEventPublisher;
import com.pactflow.domain.user.AccountType;
import com.pactflow.domain.user.ActiveMilestoneGuardPort;
import com.pactflow.domain.user.Email;
import com.pactflow.domain.user.User;
import com.pactflow.domain.user.UserRepository;
import com.pactflow.domain.user.event.UserProfileUpdatedEvent;
import com.pactflow.infrastructure.config.MetricsConfig;
import com.pactflow.infrastructure.web.exception.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProfileService unit tests covering updateProfile, account erasure, and public profile lookup")
class ProfileServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private ActiveMilestoneGuardPort activeMilestoneGuardPort;
    @Mock
    private DomainEventPublisher domainEventPublisher;
    @Mock
    private MetricsConfig metricsConfig;

    private ProfileService profileService;

    @BeforeEach
    void setUp() {
        profileService = new ProfileService(userRepository, activeMilestoneGuardPort, domainEventPublisher, metricsConfig);
    }

    @Test
    @DisplayName("updateProfile() should update user aggregate, increment metrics, and publish UserProfileUpdatedEvent")
    void shouldUpdateProfileSuccessfully() {
        final UUID userId = UUID.randomUUID();
        final User user = new User(userId, new Email("user@pactflow.io"), "hash", AccountType.FREELANCER, "Old Name", "UTC");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        final UpdateProfileRequest request = UpdateProfileRequest.builder()
                .displayName("New Display Name")
                .avatarUrl("https://cdn.pactflow.io/avatars/new.jpg")
                .timezone("Europe/Paris")
                .bio("New bio description.")
                .build();

        final ProfileResponse response = profileService.updateProfile(userId, request);

        assertThat(response.displayName()).isEqualTo("New Display Name");
        assertThat(response.avatarUrl()).isEqualTo("https://cdn.pactflow.io/avatars/new.jpg");
        assertThat(response.timezone()).isEqualTo("Europe/Paris");
        assertThat(response.bio()).isEqualTo("New bio description.");

        verify(metricsConfig).incrementProfileUpdatedCount();
        final ArgumentCaptor<UserProfileUpdatedEvent> eventCaptor = ArgumentCaptor.forClass(UserProfileUpdatedEvent.class);
        verify(domainEventPublisher).publish(eventCaptor.capture());
        assertThat(eventCaptor.getValue().aggregateId()).isEqualTo(userId);
    }

    @Test
    @DisplayName("requestAccountErasure() should throw ActiveMilestonesPreventErasureException when active milestones exist")
    void shouldRejectErasureWhenActiveMilestonesExist() {
        final UUID userId = UUID.randomUUID();
        when(activeMilestoneGuardPort.hasActiveMilestones(userId)).thenReturn(true);

        assertThatThrownBy(() -> profileService.requestAccountErasure(userId))
                .isInstanceOf(ActiveMilestonesPreventErasureException.class)
                .hasMessageContaining("Active escrows prevent deletion");

        verify(userRepository, never()).findById(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("requestAccountErasure() should soft-delete user and schedule 30-day PII erasure when no active milestones exist")
    void shouldAcceptErasureWhenNoActiveMilestones() {
        final UUID userId = UUID.randomUUID();
        final User user = new User(userId, new Email("user@pactflow.io"), "hash", AccountType.COMPANY, "Company User", "UTC");
        when(activeMilestoneGuardPort.hasActiveMilestones(userId)).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        final MessageResponse response = profileService.requestAccountErasure(userId);

        assertThat(response.message()).isEqualTo("Account deletion scheduled. You will be logged out and your data will be anonymised within 30 days.");
        assertThat(user.isDeleted()).isTrue();
        assertThat(user.isActive()).isFalse();
        verify(userRepository).save(user);
        verify(metricsConfig).incrementErasureRequestedCount();
    }

    @Test
    @DisplayName("getPublicProfile() should return non-sensitive fields when account is active")
    void shouldGetPublicProfile() {
        final UUID userId = UUID.randomUUID();
        final User user = new User(userId, new Email("sensitive@pactflow.io"), "hash", AccountType.FREELANCER, "Public Name", "UTC");
        user.updateProfile(null, "https://cdn.pactflow.io/avatar.png", null, "Public Bio");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        final PublicProfileResponse response = profileService.getPublicProfile(userId);

        assertThat(response.id()).isEqualTo(userId);
        assertThat(response.displayName()).isEqualTo("Public Name");
        assertThat(response.avatarUrl()).isEqualTo("https://cdn.pactflow.io/avatar.png");
        assertThat(response.bio()).isEqualTo("Public Bio");
        assertThat(response.accountType()).isEqualTo(AccountType.FREELANCER);
    }

    @Test
    @DisplayName("getPublicProfile() should throw EntityNotFoundException when user is not found or soft-deleted")
    void shouldThrowWhenPublicProfileNotFound() {
        final UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> profileService.getPublicProfile(userId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("not found");
    }
}
