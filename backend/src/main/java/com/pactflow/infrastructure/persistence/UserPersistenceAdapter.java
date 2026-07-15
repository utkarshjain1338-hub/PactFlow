package com.pactflow.infrastructure.persistence;

import com.pactflow.domain.user.AccountType;
import com.pactflow.domain.user.Email;
import com.pactflow.domain.user.User;
import com.pactflow.domain.user.UserRepository;
import com.pactflow.infrastructure.persistence.entity.UserJpaEntity;
import com.pactflow.infrastructure.persistence.jpa.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

/**
 * Infrastructure persistence adapter implementing the domain UserRepository port.
 *
 * <p>Authority: PROJECT_CONSTITUTION.md (Dependency Rule & Clean Architecture).
 * Maps pure domain User aggregates to UserJpaEntity records.
 */
@Component
@RequiredArgsConstructor
public class UserPersistenceAdapter implements UserRepository {

    private final UserJpaRepository userJpaRepository;

    @Override
    public Optional<User> findById(final UUID id) {
        return userJpaRepository.findByIdAndIsDeletedFalse(id)
                .map(this::toDomain);
    }

    @Override
    public Optional<User> findByEmail(final Email email) {
        return userJpaRepository.findByEmailIgnoreCaseAndIsDeletedFalse(email.getValue())
                .map(this::toDomain);
    }

    @Override
    public boolean existsByEmail(final Email email) {
        return userJpaRepository.existsByEmailIgnoreCaseAndIsDeletedFalse(email.getValue());
    }

    @Override
    public User save(final User user) {
        final UserJpaEntity entity = toEntity(user);
        final UserJpaEntity saved = userJpaRepository.saveAndFlush(entity);
        return toDomain(saved);
    }

    private User toDomain(final UserJpaEntity entity) {
        return new User(
                entity.getId(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getVersion(),
                new Email(entity.getEmail()),
                entity.getPasswordHash(),
                AccountType.valueOf(entity.getAccountType()),
                entity.getDisplayName(),
                entity.getAvatarUrl(),
                entity.getTimezone(),
                entity.getBio(),
                entity.isEmailVerified(),
                entity.isActive(),
                entity.isDeleted(),
                entity.getDeletedAt()
        );
    }

    private UserJpaEntity toEntity(final User domain) {
        return UserJpaEntity.builder()
                .id(domain.getId())
                .email(domain.getEmail().getValue())
                .passwordHash(domain.getPasswordHash())
                .accountType(domain.getAccountType().name())
                .displayName(domain.getDisplayName())
                .avatarUrl(domain.getAvatarUrl())
                .timezone(domain.getTimezone())
                .bio(domain.getBio())
                .isEmailVerified(domain.isEmailVerified())
                .isActive(domain.isActive())
                .isDeleted(domain.isDeleted())
                .deletedAt(domain.getDeletedAt())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .version(domain.getVersion())
                .build();
    }
}
