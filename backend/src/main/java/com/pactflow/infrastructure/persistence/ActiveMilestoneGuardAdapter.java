package com.pactflow.infrastructure.persistence;

import com.pactflow.domain.user.ActiveMilestoneGuardPort;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Infrastructure persistence adapter implementing the ActiveMilestoneGuardPort.
 *
 * <p>Authority: PROJECT_CONSTITUTION.md (Clean Architecture Seams),
 * API_SPECIFICATION.md Domain 2 (DELETE /users/me Business Rules).
 *
 * <p>Performs a narrow, indexed SQL read against the {@code projects} and {@code milestones}
 * tables to verify whether the account has active milestones (`FUNDED`, `IN_PROGRESS`, `SUBMITTED`)
 * without pulling in or depending on full Collaboration aggregate mappings.
 */
@Component
@RequiredArgsConstructor
public class ActiveMilestoneGuardAdapter implements ActiveMilestoneGuardPort {

    private static final Logger LOG = LoggerFactory.getLogger(ActiveMilestoneGuardAdapter.class);

    private final JdbcTemplate jdbcTemplate;

    @Override
    public boolean hasActiveMilestones(final UUID userId) {
        final String sql = """
            SELECT EXISTS (
                SELECT 1
                FROM milestones m
                INNER JOIN projects p ON m.project_id = p.id
                WHERE (p.client_id = ? OR p.assignee_id = ?)
                  AND p.is_deleted = false
                  AND m.is_deleted = false
                  AND m.status IN ('FUNDED', 'IN_PROGRESS', 'SUBMITTED')
            )
            """;
        try {
            final Boolean exists = jdbcTemplate.queryForObject(sql, Boolean.class, userId, userId);
            return Boolean.TRUE.equals(exists);
        } catch (final Exception e) {
            LOG.error("Error executing active milestone check for user {}: {}", userId, e.getMessage(), e);
            // Fail-closed for safety per Rule 5 (Security precedes features): if check fails, block erasure
            throw new IllegalStateException("Unable to verify active milestones status for user erasure check.", e);
        }
    }
}
