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
 * <p>Authority: API_SPECIFICATION.md Domain 2, DOMAIN_MODEL.md §6 & §8,
 * SYSTEM_ARCHITECTURE.md §4.2 (Application Layer Use Cases).
 */
@Service
@RequiredArgsConstructor
public class ProfileService {

    private static final Logger LOG = LoggerFactory.getLogger(ProfileService.class);

    private final UserRepository userRepository;
    private final ActiveMilestoneGuardPort activeMilestoneGuardPort;
    private final DomainEventPublisher domainEventPublisher;
    private final MetricsConfig metricsConfig;

    /**
     * Updates the authenticated user's profile fields.
     *
     * @param userId  UUID of the authenticated user
     * @param request profile update request parameters
     * @return updated profile response
     */
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

    /**
     * Requests soft-deletion and GDPR account erasure for the user.
     *
     * @param userId UUID of the authenticated user requesting erasure
     * @return message confirming erasure scheduled
     */
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
        return new MessageResponse("Account deletion scheduled. You will be logged out and your data will be "
                + "anonymised within 30 days.");
    }

    /**
     * Retrieves the public profile of any user by ID.
     *
     * @param userId UUID of the user to lookup
     * @return safe public profile response
     */
    @Transactional(readOnly = true)
    public PublicProfileResponse getPublicProfile(final UUID userId) {
        LOG.debug("Fetching public profile for user: {}", userId);
        final User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "User profile not found (or account has been deleted)."));

        return PublicProfileResponse.from(user);
    }

    /**
     * Retrieves the authenticated user's profile.
     *
     * @param userId UUID of the authenticated user
     * @return 200 OK with profile data
     */
    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile(final UUID userId) {
        LOG.debug("Fetching profile for authenticated user: {}", userId);
        final User user = findUserOrThrow(userId);
        return ProfileResponse.from(user);
    }

    private User findUserOrThrow(final UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
    }
}
