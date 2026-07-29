package com.pactflow.infrastructure.persistence.jpa;

import com.pactflow.domain.escrow.Escrow;
import com.pactflow.domain.escrow.EscrowStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
class EscrowIntegrationTests {

    @Autowired
    private EscrowRepositoryImpl escrowRepository;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    private void insertTestData(UUID userId, UUID projectId, UUID milestoneId) {
        jdbcTemplate.update("INSERT INTO users (id, email, password_hash, account_type, allowed_roles, display_name, timezone, is_email_verified, is_active, created_at, updated_at, is_deleted, version) VALUES (?, ?, 'hash', 'COMPANY', 'COMPANY', 'Test User', 'UTC', true, true, now(), now(), false, 1)", userId, "test-" + userId + "@example.com");
        
        jdbcTemplate.update("INSERT INTO projects (id, client_user_id, title, description, status, total_budget_xlm, asset_code, created_at, updated_at, is_deleted, version) VALUES (?, ?, 'Test Project', 'Desc', 'OPEN', 100, 'XLM', now(), now(), false, 1)", projectId, userId);
        
        jdbcTemplate.update("INSERT INTO milestones (id, project_id, title, description, amount_xlm, sequence_order, status, created_at, updated_at, is_deleted, version) VALUES (?, ?, 'Milestone 1', 'Desc', 100, 1, 'DRAFT', now(), now(), false, 1)", milestoneId, projectId);
    }

    @Test
    @Transactional
    void shouldSaveAndRetrieveEscrow() {
        UUID userId = UUID.randomUUID();
        UUID projectId = UUID.randomUUID();
        UUID milestoneId = UUID.randomUUID();
        insertTestData(userId, projectId, milestoneId);

        Escrow escrow = Escrow.create(projectId, milestoneId);
        Escrow saved = escrowRepository.save(escrow);
        
        Escrow retrieved = escrowRepository.findById(saved.getId()).orElseThrow();
        assertThat(retrieved.getProjectId()).isEqualTo(projectId);
        assertThat(retrieved.getMilestoneId()).isEqualTo(milestoneId);
        assertThat(retrieved.getStatus()).isEqualTo(EscrowStatus.CREATED);
        assertThat(retrieved.getVersion()).isNotNull();
    }
    
    @Autowired
    private org.springframework.transaction.support.TransactionTemplate transactionTemplate;

    @Test
    void shouldThrowOptimisticLockingFailureOnConcurrentUpdates() {
        UUID userId = UUID.randomUUID();
        UUID projectId = UUID.randomUUID();
        UUID milestoneId = UUID.randomUUID();
        
        transactionTemplate.execute(status -> {
            insertTestData(userId, projectId, milestoneId);
            return null;
        });
        
        Escrow escrow = Escrow.create(projectId, milestoneId);
        Escrow saved = escrowRepository.save(escrow);
        
        // Fetch two distinct detached copies
        Escrow copy1 = escrowRepository.findById(saved.getId()).orElseThrow();
        Escrow copy2 = escrowRepository.findById(saved.getId()).orElseThrow();
        
        copy1.initiateFunding();
        escrowRepository.save(copy1); // Saves successfully and increments version
        
        copy2.markFailed(); // Try to save from old version
        
        assertThatThrownBy(() -> escrowRepository.save(copy2))
            .isInstanceOf(ObjectOptimisticLockingFailureException.class);
    }
}
