package com.pactflow.integration.user;

import com.pactflow.domain.user.AccountType;
import com.pactflow.domain.user.Email;
import com.pactflow.domain.user.User;
import com.pactflow.domain.user.UserRepository;
import com.pactflow.infrastructure.persistence.UserPersistenceAdapter;
import com.pactflow.infrastructure.persistence.jpa.UserJpaRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Testcontainers(disabledWithoutDocker = true)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(UserPersistenceAdapter.class)
@DisplayName("UserProfileIntegrationTest database slice testing persistence, soft-delete, and V15 anonymize_user function")
class UserProfileIntegrationTest {

    @Container
    private static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("pactflow_test")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.enabled", () -> "true");
    }

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserJpaRepository userJpaRepository;

    @Test
    @DisplayName("Should save, update profile, soft-delete, and execute V15 anonymizeUser DB function via persistence adapter")
    void shouldTestUserLifecycleAndAnonymization() {
        // 1. Create and save user
        final UUID userId = UUID.randomUUID();
        final User user = new User(
                userId,
                new Email("integration@pactflow.io"),
                "hash123",
                AccountType.FREELANCER,
                "Integration Engineer",
                "America/Los_Angeles"
        );
        userRepository.save(user);

        // Verify loaded correctly
        final Optional<User> loadedOpt = userRepository.findById(userId);
        assertThat(loadedOpt).isPresent();
        assertThat(loadedOpt.get().getDisplayName()).isEqualTo("Integration Engineer");

        // 2. Soft-delete account
        final User loaded = loadedOpt.get();
        loaded.softDelete();
        userRepository.save(loaded);

        // findById should now return empty because isDeleted = true
        assertThat(userRepository.findById(userId)).isEmpty();

        // But findByIdIncludingDeleted should return the soft-deleted user
        final Optional<User> deletedOpt = userRepository.findByIdIncludingDeleted(userId);
        assertThat(deletedOpt).isPresent();
        assertThat(deletedOpt.get().isDeleted()).isTrue();
        assertThat(deletedOpt.get().getEmail()).isNotNull();

        // And findSoftDeletedPendingAnonymization should list this user
        final List<User> pending = userRepository.findSoftDeletedPendingAnonymization(10);
        assertThat(pending).anyMatch(u -> u.getId().equals(userId));

        // 3. Execute database procedure anonymizeUser (V15 migration function)
        userRepository.anonymizeUser(userId);

        // Verify PII is nulled out while ID is preserved
        final Optional<User> anonymizedOpt = userRepository.findByIdIncludingDeleted(userId);
        assertThat(anonymizedOpt).isPresent();
        final User anonymized = anonymizedOpt.get();
        assertThat(anonymized.getId()).isEqualTo(userId);
        assertThat(anonymized.getEmail()).isNull();
        assertThat(anonymized.getDisplayName()).isNull();
        assertThat(anonymized.getAvatarUrl()).isNull();
        assertThat(anonymized.getBio()).isNull();
        assertThat(anonymized.getPasswordHash()).isNull();
        assertThat(anonymized.isDeleted()).isTrue();
    }
}
