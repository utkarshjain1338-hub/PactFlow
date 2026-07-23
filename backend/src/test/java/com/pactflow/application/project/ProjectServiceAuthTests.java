package com.pactflow.application.project;

import com.pactflow.application.project.dto.CreateProjectRequest;
import com.pactflow.application.project.dto.UpdateProjectRequest;
import com.pactflow.domain.project.Project;
import com.pactflow.domain.project.ProjectRepository;
import com.pactflow.domain.wallet.Wallet;
import com.pactflow.domain.wallet.WalletProvider;
import com.pactflow.infrastructure.persistence.WalletRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceAuthTests {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ProjectService projectService;

    @Test
    void shouldCreateProjectSuccessfully() {
        UUID clientUserId = UUID.randomUUID();
        CreateProjectRequest request = new CreateProjectRequest();
        request.setTitle("Test");
        request.setDescription("Desc");
        request.setTotalBudgetXlm(BigDecimal.valueOf(100));
        
        Project mockProject = Project.create(clientUserId, null, "Test", "Desc", BigDecimal.valueOf(100), LocalDate.now());
        when(projectRepository.save(any(Project.class))).thenReturn(mockProject);
        
        projectService.createProject(clientUserId, request);
        verify(projectRepository, times(1)).save(any(Project.class));
    }

    @Test
    void shouldDenyUpdateFromNonOwner() {
        UUID clientUserId = UUID.randomUUID();
        UUID attackerId = UUID.randomUUID();
        Project project = Project.create(clientUserId, null, "Test", "Desc", BigDecimal.valueOf(100), LocalDate.now());
        
        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        
        UpdateProjectRequest updateRequest = new UpdateProjectRequest();
        updateRequest.setTitle("Hacked Title");
        
        assertThatThrownBy(() -> projectService.updateProject(project.getId(), attackerId, updateRequest))
            .isInstanceOf(AccessDeniedException.class)
            .hasMessageContaining("Only the project owner can update this project");
    }
    
    @Test
    void shouldDenyWalletLinkFromNonOwner() {
        UUID clientUserId = UUID.randomUUID();
        UUID attackerId = UUID.randomUUID();
        Project project = Project.create(clientUserId, null, "Test", "Desc", BigDecimal.valueOf(100), LocalDate.now());
        
        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        
        UUID walletId = UUID.randomUUID();
        
        assertThatThrownBy(() -> projectService.linkClientWallet(project.getId(), attackerId, walletId))
            .isInstanceOf(AccessDeniedException.class)
            .hasMessageContaining("Only the client can link the client wallet");
    }
    
    @Test
    void shouldDenyLinkingUnverifiedWallet() {
        UUID clientUserId = UUID.randomUUID();
        Project project = Project.create(clientUserId, null, "Test", "Desc", BigDecimal.valueOf(100), LocalDate.now());
        
        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        
        UUID walletId = UUID.randomUUID();
        Wallet unverifiedWallet = new Wallet(walletId, clientUserId, "G123", WalletProvider.FREIGHTER);
        // Not verified!
        
        when(walletRepository.findByIdAndUserId(walletId, clientUserId)).thenReturn(Optional.of(unverifiedWallet));
        
        assertThatThrownBy(() -> projectService.linkClientWallet(project.getId(), clientUserId, walletId))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Wallet must be verified before linking");
    }
    
    @Test
    void shouldLinkVerifiedWalletSuccessfully() {
        UUID clientUserId = UUID.randomUUID();
        Project project = Project.create(clientUserId, null, "Test", "Desc", BigDecimal.valueOf(100), LocalDate.now());
        
        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        
        UUID walletId = UUID.randomUUID();
        Wallet verifiedWallet = new Wallet(walletId, clientUserId, "G123", WalletProvider.FREIGHTER);
        verifiedWallet.verify(); // Now verified
        
        when(walletRepository.findByIdAndUserId(walletId, clientUserId)).thenReturn(Optional.of(verifiedWallet));
        when(projectRepository.save(any(Project.class))).thenReturn(project);
        
        projectService.linkClientWallet(project.getId(), clientUserId, walletId);
        
        verify(projectRepository, times(1)).save(project);
    }
}
