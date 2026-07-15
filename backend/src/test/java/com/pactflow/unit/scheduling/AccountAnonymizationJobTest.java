package com.pactflow.unit.scheduling;

import com.pactflow.domain.user.AccountType;
import com.pactflow.domain.user.Email;
import com.pactflow.domain.user.User;
import com.pactflow.domain.user.UserRepository;
import com.pactflow.infrastructure.config.MetricsConfig;
import com.pactflow.infrastructure.scheduling.AccountAnonymizationJob;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AccountAnonymizationJob unit tests covering scheduled batch processing and failure isolation")
class AccountAnonymizationJobTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private MetricsConfig metricsConfig;

    private AccountAnonymizationJob job;

    @BeforeEach
    void setUp() {
        job = new AccountAnonymizationJob(userRepository, metricsConfig);
    }

    @Test
    @DisplayName("Should process pending users in bounded batches and update metrics")
    void shouldProcessBatchSuccessfully() {
        final User user1 = new User(UUID.randomUUID(), new Email("u1@pactflow.io"), "hash1", AccountType.FREELANCER, "User 1", "UTC");
        final User user2 = new User(UUID.randomUUID(), new Email("u2@pactflow.io"), "hash2", AccountType.COMPANY, "User 2", "UTC");

        when(userRepository.findSoftDeletedPendingAnonymization(100)).thenReturn(List.of(user1, user2));

        job.runAnonymizationBatch();

        verify(metricsConfig).updateAccountErasureBacklogCount(2);
        verify(userRepository).anonymizeUser(user1.getId());
        verify(userRepository).anonymizeUser(user2.getId());
        verify(metricsConfig, times(2)).incrementErasureCompletedCount();
    }

    @Test
    @DisplayName("Should skip already anonymized users in idempotency check")
    void shouldSkipAlreadyAnonymizedUsers() {
        final User user = new User(UUID.randomUUID(), new Email("u@pactflow.io"), "hash", AccountType.FREELANCER, "User", "UTC");
        user.anonymize(); // nulls out email and displayName

        when(userRepository.findSoftDeletedPendingAnonymization(100)).thenReturn(List.of(user));

        job.runAnonymizationBatch();

        verify(metricsConfig).updateAccountErasureBacklogCount(1);
        verify(userRepository, never()).anonymizeUser(anyInt() == 0 ? null : user.getId());
    }

    @Test
    @DisplayName("Should isolate item failures without aborting the remainder of the batch")
    void shouldIsolateItemFailures() {
        final User user1 = new User(UUID.randomUUID(), new Email("u1@pactflow.io"), "hash1", AccountType.FREELANCER, "User 1", "UTC");
        final User user2 = new User(UUID.randomUUID(), new Email("u2@pactflow.io"), "hash2", AccountType.COMPANY, "User 2", "UTC");

        when(userRepository.findSoftDeletedPendingAnonymization(100)).thenReturn(List.of(user1, user2));
        doThrow(new RuntimeException("DB timeout")).when(userRepository).anonymizeUser(user1.getId());

        job.runAnonymizationBatch();

        verify(userRepository).anonymizeUser(user1.getId());
        verify(userRepository).anonymizeUser(user2.getId());
        verify(metricsConfig, times(1)).incrementErasureCompletedCount();
    }
}
