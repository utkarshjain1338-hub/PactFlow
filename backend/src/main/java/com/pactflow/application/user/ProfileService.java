package com.pactflow.application.user;

import com.pactflow.application.auth.dto.MessageResponse;
import com.pactflow.application.user.dto.ProfileResponse;
import com.pactflow.application.user.dto.PublicProfileResponse;
import com.pactflow.application.user.dto.UpdateProfileRequest;
import com.pactflow.application.user.exception.ActiveMilestonesPreventErasureException;
import com.pactflow.domain.shared.DomainEventPublisher;
import com.pactflow.domain.user.ActiveMilestoneGuardPort;
import com.pactflow.domain.user.User;
import com.pactflow.domain.user.UserRepository;
import com.pactflow.domain.user.event.UserProfileUpdatedEvent;
import com.pactflow.infrastructure.config.MetricsConfig;
import com.pactflow.infrastructure.web.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Application facade service implementing User Profile management and account erasure operations.
 *
 * <p>Authority: API_SPECIFICATION.md Domain 2, DOMAIN_MODEL.md §6 & §8,
 * SYSTEM_ARCHITECTURE.md §4.2 (Application Layer Use Cases).
 *
 * <p>Implements:
 * <ul>
 *   <li>{@link UpdateProfileUseCase} — {@code PATCH /api/v1/users/me}</li>
 *   <li>{@link RequestAccountErasureUseCase} — {@code DELETE /api/v1/users/me}</li>
 *   <li>{@link GetPublicProfileUseCase} — {@code GET /api/v1/users/{id}/profile}</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class ProfileService implements UpdateProfileUseCase, RequestAccountErasureUseCase, GetPublicProfileUseCase {

    private static final Logger LOG = LoggerFactory.getLogger(ProfileService.class);

    private final UserRepository userRepository;
    private final ActiveMilestoneGuardPort activeMilestoneGuardPort;
    private final DomainEventPublisher domainEventPublisher;
    private final MetricsConfig metricsConfig;

    @Override
    @Transactional
    public ProfileResponse updateProfile(final UUID userId, final UpdateProfileRequest request) {
        LOG.info("Updating profile for user: {}", userId);
        final User user = findUserOrThrow(userId);

        user.updateProfile(
                request.displayName(),
                request.avatarUrl(),
                request.timezone(),
                request.bio()
        );

        final User saved = userRepository.save(user);
        metricsConfig.incrementProfileUpdatedCount();
        domainEventPublisher.publish(UserProfileUpdatedEvent.of(saved));

        LOG.info("Profile updated successfully for user: {}", userId);
        return ProfileResponse.from(saved);
    }

    @Override
    @Transactional
    public MessageResponse requestAccountErasure(final UUID userId) {
        LOG.info("Processing account erasure request for user: {}", userId);
        if (activeMilestoneGuardPort.hasActiveMilestones(userId)) {
            LOG.warn("Account erasure rejected for user {}: active milestones exist", userId);
            throw new ActiveMilestonesPreventErasureException();
        }

        final User user = findUserOrThrow(userId);

        user.softDelete();
        userRepository.save(user);
        metricsConfig.incrementErasureRequestedCount();

        LOG.info("Account soft-deleted and erasure scheduled for user: {}", userId);
        return new MessageResponse("Account deletion scheduled. You will be logged out and your data will be anonymised within 30 days.");
    }

    @Override
    @Transactional(readOnly = true)
    public PublicProfileResponse getPublicProfile(final UUID userId) {
        LOG.debug("Fetching public profile for user: {}", userId);
        final User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User profile not found (or account has been deleted)."));

        return PublicProfileResponse.from(user);
    }

    private User findUserOrThrow(final UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
    }
}
