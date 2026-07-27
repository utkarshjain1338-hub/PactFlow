package com.pactflow.domain.project;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.pactflow.domain.milestone.Milestone;
import com.pactflow.domain.milestone.MilestoneStatus;

class ProjectDomainTests {

    @Test
    void shouldCreateProjectWithValidParameters() {
        UUID clientUserId = UUID.randomUUID();
        Project project = Project.create(clientUserId, null, "Test Project", null, BigDecimal.valueOf(100), LocalDate.now().plusDays(10));
        
        assertThat(project.getId()).isNotNull();
        assertThat(project.getClientUserId()).isEqualTo(clientUserId);
        assertThat(project.getFreelancerUserId()).isNull();
        assertThat(project.getStatus()).isEqualTo(ProjectStatus.DRAFT);
        assertThat(project.getDescription()).isNull();
        assertThat(project.getMilestones()).isEmpty();
        assertThat(project.isStructurallyReady()).isFalse();
    }

    @Test
    void shouldFailToCreateProjectWithNegativeBudget() {
        UUID clientUserId = UUID.randomUUID();
        assertThatThrownBy(() -> Project.create(clientUserId, null, "Test", "Desc", BigDecimal.valueOf(-10), LocalDate.now()))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Total budget must be positive");
    }

    @Test
    void shouldSuccessfullyAddMilestoneWithinBudget() {
        Project project = Project.create(UUID.randomUUID(), null, "Test", "Desc", BigDecimal.valueOf(100), LocalDate.now());
        
        Milestone milestone = Milestone.create(project.getId(), "M1", "M1 desc", BigDecimal.valueOf(50), 1, LocalDate.now(), false);
        project.addMilestone(milestone);
        
        assertThat(project.getMilestones()).hasSize(1);
    }

    @Test
    void shouldFailToAddMilestoneExceedingBudget() {
        Project project = Project.create(UUID.randomUUID(), null, "Test", "Desc", BigDecimal.valueOf(100), LocalDate.now());
        
        Milestone m1 = Milestone.create(project.getId(), "M1", "M1 desc", BigDecimal.valueOf(60), 1, LocalDate.now(), false);
        project.addMilestone(m1);
        
        Milestone m2 = Milestone.create(project.getId(), "M2", "M2 desc", BigDecimal.valueOf(50), 2, LocalDate.now(), false);
        
        assertThatThrownBy(() -> project.addMilestone(m2))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Milestones total amount exceeds project budget.");
    }
    
    @Test
    void shouldAllowWalletLinkingBeforeFunding() {
        Project project = Project.create(UUID.randomUUID(), UUID.randomUUID(), "Test", "Desc", BigDecimal.valueOf(100), LocalDate.now());
        UUID walletId = UUID.randomUUID();
        
        project.linkClientWallet(walletId);
        assertThat(project.getClientWalletId()).isEqualTo(walletId);
        
        project.unlinkClientWallet();
        assertThat(project.getClientWalletId()).isNull();
    }
    
    @Test
    void shouldPreventWalletLinkingAfterFunding() {
        Project project = Project.create(UUID.randomUUID(), UUID.randomUUID(), "Test", "Desc", BigDecimal.valueOf(100), LocalDate.now());
        
        Milestone m1 = Milestone.create(project.getId(), "M1", "M1 desc", BigDecimal.valueOf(60), 1, LocalDate.now(), false);
        Milestone fundedM1 = m1.toBuilder().status(MilestoneStatus.FUNDED).build();
        project.addMilestone(fundedM1);
        
        UUID walletId = UUID.randomUUID();
        assertThatThrownBy(() -> project.linkClientWallet(walletId))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("after escrow funding has occurred or project is closed");
    }
    
    @Test
    void shouldPreventWalletLinkingIfProjectArchivedOrCancelled() {
        Project project = Project.create(UUID.randomUUID(), UUID.randomUUID(), "Test", "Desc", BigDecimal.valueOf(100), LocalDate.now());
        Project cancelledProject = project.toBuilder().status(ProjectStatus.CANCELLED).build();
        
        UUID walletId = UUID.randomUUID();
        assertThatThrownBy(() -> cancelledProject.linkClientWallet(walletId))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("after escrow funding has occurred or project is closed");
    }
    
    @Test
    void shouldBeStructurallyReadyOnlyWhenBothWalletsLinkedAndActive() {
        Project project = Project.create(UUID.randomUUID(), UUID.randomUUID(), "Test", "Desc", BigDecimal.valueOf(100), LocalDate.now());
        
        assertThat(project.isStructurallyReady()).isFalse();
        
        project.linkClientWallet(UUID.randomUUID());
        assertThat(project.isStructurallyReady()).isFalse();
        
        project.linkFreelancerWallet(UUID.randomUUID());
        assertThat(project.isStructurallyReady()).isFalse(); // Status is DRAFT
        
        Project activeProject = project.toBuilder().status(ProjectStatus.ACTIVE).build();
        assertThat(activeProject.isStructurallyReady()).isTrue();
    }
}
