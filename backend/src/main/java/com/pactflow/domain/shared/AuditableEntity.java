package com.pactflow.domain.shared;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Base class for all PactFlow domain entities that require audit tracking.
 *
 * <p>Provides: UUID v7 primary key, created_at, updated_at, and an optimistic
 * locking version counter — as specified in DOMAIN_MODEL.md §8.
 *
 * <p>CRITICAL ARCHITECTURE INVARIANT: This class is pure Java.
 * Zero dependencies on Spring, JPA, Hibernate, or any framework.
 * Per PROJECT_CONSTITUTION.md (Dependency Rule): "The Domain Layer has zero
 * dependencies on frameworks, databases, or blockchain SDKs."
 *
 * <p>JPA annotations are placed on infrastructure-layer @Entity wrappers
 * in {@code com.pactflow.infrastructure.persistence.entity}, not here.
 */
public abstract class AuditableEntity {

    private final UUID id;
    private final Instant createdAt;
    private Instant updatedAt;
    private long version;

    /**
     * Constructs a new AuditableEntity with the given ID and current timestamp.
     *
     * @param id the UUID v7 primary key generated at the application layer
     */
    protected AuditableEntity(final UUID id) {
        this.id = Objects.requireNonNull(id, "Entity ID must not be null");
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
        this.version = 1L;
    }

    /**
     * Reconstructs an AuditableEntity from persistence (all fields known).
     *
     * @param id        the persisted UUID
     * @param createdAt original creation timestamp
     * @param updatedAt last update timestamp
     * @param version   current optimistic lock version
     */
    protected AuditableEntity(
            final UUID id,
            final Instant createdAt,
            final Instant updatedAt,
            final long version) {
        this.id = Objects.requireNonNull(id, "Entity ID must not be null");
        this.createdAt = Objects.requireNonNull(createdAt, "createdAt must not be null");
        this.updatedAt = Objects.requireNonNull(updatedAt, "updatedAt must not be null");
        this.version = version;
    }

    /**
     * Returns the entity's UUID v7 primary key.
     *
     * @return entity ID, never null
     */
    public UUID getId() {
        return id;
    }

    /**
     * Returns the timestamp at which this entity was first created.
     *
     * @return creation instant, never null
     */
    public Instant getCreatedAt() {
        return createdAt;
    }

    /**
     * Returns the timestamp of the most recent update to this entity.
     *
     * @return last update instant, never null
     */
    public Instant getUpdatedAt() {
        return updatedAt;
    }

    /**
     * Returns the current optimistic locking version.
     * DOMAIN_MODEL.md §8: incremented on every UPDATE to prevent lost updates.
     *
     * @return version counter (starts at 1)
     */
    public long getVersion() {
        return version;
    }

    /**
     * Records a domain mutation by advancing the updated timestamp.
     * Must be called by subclasses on every state-changing operation.
     */
    protected void touch() {
        this.updatedAt = Instant.now();
    }

    @Override
    public boolean equals(final Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }
        final AuditableEntity that = (AuditableEntity) obj;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return getClass().getSimpleName() + "{id=" + id + ", version=" + version + "}";
    }
}
