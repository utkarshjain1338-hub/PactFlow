package com.pactflow.infrastructure.persistence.jpa;

import com.pactflow.domain.project.Project;
import com.pactflow.domain.project.ProjectStatus;
import com.pactflow.domain.milestone.Milestone;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class ProjectIntegrationTests {

    @Autowired
    private ProjectRepositoryImpl projectRepository;

    @Test
    @Transactional
    void shouldSaveAndRetrieveProjectWithMilestones() {
        // Given
        UUID clientUserId = UUID.randomUUID();
        Project project = Project.create(clientUserId, null, "Integration Test", "Desc", BigDecimal.valueOf(100), LocalDate.now());
        
        Milestone milestone1 = Milestone.create(project.getId(), "M1", "M1 desc", BigDecimal.valueOf(40), 1, LocalDate.now(), false);
        project.addMilestone(milestone1);
        
        Milestone milestone2 = Milestone.create(project.getId(), "M2", "M2 desc", BigDecimal.valueOf(60), 2, LocalDate.now(), false);
        project.addMilestone(milestone2);

        // When
        Project savedProject = projectRepository.save(project);

        // Then
        Project retrievedProject = projectRepository.findById(savedProject.getId()).orElseThrow();
        
        assertThat(retrievedProject.getTitle()).isEqualTo("Integration Test");
        assertThat(retrievedProject.getStatus()).isEqualTo(ProjectStatus.OPEN);
        assertThat(retrievedProject.getMilestones()).hasSize(2);
        
        // Assert milestone totals
        BigDecimal totalMilestoneAmount = retrievedProject.getMilestones().stream()
            .map(Milestone::getAmountXlm)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        assertThat(totalMilestoneAmount).isEqualByComparingTo(BigDecimal.valueOf(100));
    }
}
