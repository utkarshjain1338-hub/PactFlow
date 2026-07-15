package com.pactflow.infrastructure.scheduling;

import com.pactflow.domain.user.User;
import com.pactflow.domain.user.UserRepository;
import com.pactflow.infrastructure.config.MetricsConfig;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

/**
 * Scheduled daemon processing soft-deleted user accounts to perform final PII anonymization.
 *
 * <p>Authority: DOMAIN_MODEL.md §8 item 7, API_SPECIFICATION.md Domain 2 (`DELETE /users/me`),
 * PROJECT_CONSTITUTION.md (Clean Architecture & Reliability).
 *
 * <p>Guarantees full PII anonymization (`email`, `displayName`, `avatarUrl`, `bio`, `passwordHash`)
 * well within the promised 30-day GDPR SLA. Processes in bounded batches (`BATCH_SIZE = 100`) to
 * prevent long-held database locks or high memory consumption.
 */
@Component
@RequiredArgsConstructor
public class AccountAnonymizationJob {

    private static final Logger LOG = LoggerFactory.getLogger(AccountAnonymizationJob.class);
    private static final int BATCH_SIZE = 100;
    private static final Duration SLA_WARNING_THRESHOLD = Duration.ofDays(20);

    private final UserRepository userRepository;
    private final MetricsConfig metricsConfig;

    @Scheduled(fixedDelayString = "${pactflow.scheduling.anonymization-interval-ms:3600000}")
    @Transactional
    public void runAnonymizationBatch() {
        LOG.debug("Starting scheduled account anonymization batch cycle...");
        int processed = 0;
        int skipped = 0;
        int failed = 0;

        try {
            final List<User> pendingUsers = userRepository.findSoftDeletedPendingAnonymization(BATCH_SIZE);
            metricsConfig.updateAccountErasureBacklogCount(pendingUsers.size());

            if (pendingUsers.isEmpty()) {
                LOG.debug("No soft-deleted accounts pending anonymization.");
                return;
            }

            LOG.info("Found {} soft-deleted account(s) pending anonymization in current batch.", pendingUsers.size());
            final Instant now = Instant.now();

            for (final User user : pendingUsers) {
                try {
                    // Double check idempotency seam
                    if (user.getEmail() == null && user.getDisplayName() == null) {
                        skipped++;
                        continue;
                    }

                    // Check if approaching 30-day compliance SLA limit (e.g. > 20 days old)
                    if (user.getDeletedAt() != null && user.getDeletedAt().isBefore(now.minus(SLA_WARNING_THRESHOLD))) {
                        LOG.warn("COMPLIANCE ALERT: Account {} soft-deleted at {} is over 20 days old pending anonymization! Approaching 30-day GDPR SLA limit.",
                                user.getId(), user.getDeletedAt());
                    }

                    userRepository.anonymizeUser(user.getId());
                    metricsConfig.incrementErasureCompletedCount();
                    processed++;
                    LOG.info("Successfully completed PII anonymization for account ID: {}", user.getId());
                } catch (final Exception e) {
                    failed++;
                    LOG.error("Failed to anonymize account ID: {}. Reason: {}", user.getId(), e.getMessage(), e);
                }
            }
        } catch (final Exception e) {
            LOG.error("Account anonymization batch query failed unexpectedly: {}", e.getMessage(), e);
        }

        LOG.info("Account anonymization batch cycle finished: {} processed, {} skipped, {} failed.", processed, skipped, failed);
    }
}
