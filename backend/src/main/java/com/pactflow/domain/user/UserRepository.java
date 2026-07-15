package com.pactflow.domain.user;

import java.util.Optional;
import java.util.UUID;

/**
 * Domain port interface for User aggregate root persistence.
 *
 * <p>Authority: PROJECT_CONSTITUTION.md (Dependency Rule), DOMAIN_MODEL.md §2.
 *
 * <p>Implemented at the infrastructure layer by
 * {@code com.pactflow.infrastructure.persistence.UserPersistenceAdapter}.
 */
public interface UserRepository {

    /**
     * Finds a user by their UUID primary key.
     *
     * @param id user UUID v7
     * @return optional containing user if found and not soft-deleted
     */
    Optional<User> findById(UUID id);

    /**
     * Finds a user by their validated Email address.
     *
     * @param email user email value object
     * @return optional containing user if found and not soft-deleted
     */
    Optional<User> findByEmail(Email email);

    /**
     * Checks if a user already exists with the given email address.
     *
     * @param email user email value object
     * @return true if an active or un-deleted record exists with this email
     */
    boolean existsByEmail(Email email);

    /**
     * Persists or updates the User aggregate root.
     *
     * @param user user aggregate to save
     * @return persisted user aggregate with updated version
     */
    User save(User user);

    /**
     * Finds a user by their UUID primary key regardless of soft-delete status.
     * Needed for public profile or audit verification.
     *
     * @param id user UUID v7
     * @return optional containing user if found
     */
    Optional<User> findByIdIncludingDeleted(UUID id);

    /**
     * Retrieves soft-deleted accounts that have not yet had their PII nulled out.
     *
     * @param limit maximum batch size to fetch
     * @return list of pending soft-deleted users
     */
    java.util.List<User> findSoftDeletedPendingAnonymization(int limit);

    /**
     * Invokes the database-level anonymize_user procedure/function on the specified account.
     *
     * @param userId UUID v7 of the account to anonymize
     */
    void anonymizeUser(UUID userId);
}
