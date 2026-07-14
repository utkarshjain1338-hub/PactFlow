package com.pactflow.unit.domain;

import com.pactflow.domain.shared.AuditableEntity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNullPointerException;

/**
 * Unit tests for AuditableEntity base domain class.
 *
 * <p>Authority: PROJECT_CONSTITUTION.md §9 (Unit Tests mandatory for all Domain logic)
 * DOMAIN_MODEL.md §8 (Audit Fields specification)
 */
@DisplayName("AuditableEntity domain base class")
class AuditableEntityTest {

    // Concrete stub for testing the abstract base class
    static class TestEntity extends AuditableEntity {
        TestEntity(final UUID id) {
            super(id);
        }

        TestEntity(final UUID id, final Instant createdAt, final Instant updatedAt, final long version) {
            super(id, createdAt, updatedAt, version);
        }

        void mutate() {
            touch();
        }
    }

    @Test
    @DisplayName("Should initialize with provided UUID")
    void shouldInitializeWithProvidedUuid() {
        final UUID id = UUID.randomUUID();
        final TestEntity entity = new TestEntity(id);

        assertThat(entity.getId()).isEqualTo(id);
    }

    @Test
    @DisplayName("Should set createdAt and updatedAt to current time on construction")
    void shouldSetTimestampsOnConstruction() {
        final Instant before = Instant.now();
        final TestEntity entity = new TestEntity(UUID.randomUUID());
        final Instant after = Instant.now();

        assertThat(entity.getCreatedAt()).isBetween(before, after);
        assertThat(entity.getUpdatedAt()).isBetween(before, after);
    }

    @Test
    @DisplayName("Should start with version=1")
    void shouldStartWithVersionOne() {
        final TestEntity entity = new TestEntity(UUID.randomUUID());
        assertThat(entity.getVersion()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should update updatedAt when touch() is called")
    void shouldUpdateUpdatedAtOnTouch() throws InterruptedException {
        final TestEntity entity = new TestEntity(UUID.randomUUID());
        final Instant originalUpdatedAt = entity.getUpdatedAt();

        Thread.sleep(5); // Ensure measurable time difference
        entity.mutate();

        assertThat(entity.getUpdatedAt())
                .as("updatedAt should advance after touch()")
                .isAfter(originalUpdatedAt);
        assertThat(entity.getCreatedAt())
                .as("createdAt should NOT change after touch()")
                .isEqualTo(entity.getCreatedAt());
    }

    @Test
    @DisplayName("Should reject null ID")
    void shouldRejectNullId() {
        assertThatNullPointerException()
                .isThrownBy(() -> new TestEntity(null))
                .withMessageContaining("Entity ID must not be null");
    }

    @Test
    @DisplayName("Should be equal when IDs are equal")
    void shouldBeEqualWhenIdsAreEqual() {
        final UUID id = UUID.randomUUID();
        final TestEntity e1 = new TestEntity(id);
        final TestEntity e2 = new TestEntity(id, Instant.now(), Instant.now(), 5L);

        assertThat(e1).isEqualTo(e2);
        assertThat(e1.hashCode()).isEqualTo(e2.hashCode());
    }

    @Test
    @DisplayName("Should not be equal when IDs differ")
    void shouldNotBeEqualWhenIdsDiffer() {
        final TestEntity e1 = new TestEntity(UUID.randomUUID());
        final TestEntity e2 = new TestEntity(UUID.randomUUID());

        assertThat(e1).isNotEqualTo(e2);
    }

    @Test
    @DisplayName("Should have meaningful toString")
    void shouldHaveMeaningfulToString() {
        final UUID id = UUID.randomUUID();
        final TestEntity entity = new TestEntity(id);

        assertThat(entity.toString())
                .contains("TestEntity")
                .contains(id.toString())
                .contains("version=1");
    }
}
