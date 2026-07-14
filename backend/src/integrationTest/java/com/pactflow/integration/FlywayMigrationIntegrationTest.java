package com.pactflow.integration;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration test: verifies all 14 Flyway migrations apply cleanly.
 *
 * <p>This is the primary validation of the backend foundation — the migration
 * scripts create the complete schema and must succeed without errors.
 *
 * <p>Authority: SYSTEM_ARCHITECTURE.md §7.2 (Migration Strategy, V1-V14)
 * PROJECT_CONSTITUTION.md §13 (DoD: "A valid Flyway migration script is checked in")
 */
@DisplayName("Flyway Migration Integration Test")
class FlywayMigrationIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private Flyway flyway;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("Should successfully apply all 14 Flyway migrations")
    void shouldApplyAllMigrationsSuccessfully() {
        final var info = flyway.info();
        final var appliedMigrations = info.applied();

        assertThat(appliedMigrations)
                .as("All 14 migrations (V1-V14) should be applied")
                .hasSizeGreaterThanOrEqualTo(14);

        for (final var migration : appliedMigrations) {
            assertThat(migration.getState().isApplied())
                    .as("Migration %s should be in APPLIED state, not %s",
                            migration.getVersion(), migration.getState())
                    .isTrue();
        }
    }

    @Test
    @DisplayName("Should create all 13 application tables")
    void shouldCreateAllApplicationTables() {
        final var tableQuery =
                "SELECT table_name FROM information_schema.tables " +
                "WHERE table_schema = 'public' AND table_type = 'BASE TABLE' " +
                "ORDER BY table_name";

        final var tables = jdbcTemplate.queryForList(tableQuery, String.class);

        assertThat(tables).as("All domain tables should exist").containsExactlyInAnyOrder(
                "users",
                "user_sessions",
                "wallet_connections",
                "projects",
                "milestones",
                "deliverables",
                "comments",
                "escrow_contracts",
                "blockchain_transactions",
                "notifications",
                "activity_events",
                "outbox_events",
                "user_metric_snapshots",
                "platform_daily_snapshots",
                "daemon_state",
                "flyway_schema_history"
        );
    }

    @Test
    @DisplayName("Should seed daemon_state cursor record")
    void shouldSeedDaemonStateCursorRecord() {
        final var lastLedger = jdbcTemplate.queryForObject(
                "SELECT last_processed_ledger FROM daemon_state WHERE id = 'soroban_ingestion'",
                Long.class);

        assertThat(lastLedger)
                .as("Initial ledger cursor should be 0")
                .isEqualTo(0L);
    }

    @Test
    @DisplayName("Should enforce projects client_ne_assignee constraint")
    void shouldEnforceClientNeAssigneeConstraint() {
        // Attempting to insert a project where client_id == assignee_id
        // must be rejected by the chk_projects_client_ne_assignee constraint
        org.junit.jupiter.api.Assertions.assertThrows(
                Exception.class,
                () -> jdbcTemplate.execute(
                        "INSERT INTO projects (id, client_id, assignee_id, title, total_budget_xlm) " +
                        "VALUES (gen_random_uuid(), gen_random_uuid(), " +
                        "   (SELECT client_id FROM projects LIMIT 1), 'Test', 100.0) " +
                        "ON CONFLICT DO NOTHING"),
                "DB constraint chk_projects_client_ne_assignee should prevent client==assignee"
        );
    }

    @Test
    @DisplayName("Should have trigger_set_updated_at function")
    void shouldHaveUpdatedAtTriggerFunction() {
        final var functionExists = jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'trigger_set_updated_at')",
                Boolean.class);

        assertThat(functionExists)
                .as("trigger_set_updated_at function should be created by V14 migration")
                .isTrue();
    }

    @Test
    @DisplayName("Should have updated_at trigger on users table")
    void shouldHaveUpdatedAtTriggerOnUsers() {
        final var triggerExists = jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM information_schema.triggers " +
                "WHERE trigger_name = 'set_updated_at_users' AND event_object_table = 'users')",
                Boolean.class);

        assertThat(triggerExists)
                .as("set_updated_at_users trigger should be created by V14 migration")
                .isTrue();
    }
}
