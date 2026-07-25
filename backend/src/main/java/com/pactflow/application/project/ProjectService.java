package com.pactflow.application.project;

import com.pactflow.application.project.dto.CreateProjectRequest;
import com.pactflow.application.project.dto.ProjectDto;
import com.pactflow.application.project.dto.UpdateProjectRequest;
import com.pactflow.domain.project.Project;
import com.pactflow.domain.project.ProjectRepository;
import com.pactflow.domain.project.ProjectStatus;
import com.pactflow.domain.wallet.Wallet;
import com.pactflow.domain.wallet.WalletRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final WalletRepository walletRepository;
    private final ApplicationEventPublisher eventPublisher;

    public ProjectService(ProjectRepository projectRepository, WalletRepository walletRepository, ApplicationEventPublisher eventPublisher) {
        this.projectRepository = projectRepository;
        this.walletRepository = walletRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ProjectDto createProject(UUID clientUserId, CreateProjectRequest request) {
        // Validation handled by Project.create and DTO annotations
        Project project = Project.create(
                clientUserId,
                request.getFreelancerUserId(),
                request.getTitle(),
                request.getDescription(),
                request.getTotalBudgetXlm(),
                request.getDeadline()
        );

        Project savedProject = projectRepository.save(project);
        
        return toDto(savedProject);
    }

    @Transactional(readOnly = true)
    public ProjectDto getProject(UUID projectId, UUID requesterId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));
                
        // Authorization check
        if (!project.getClientUserId().equals(requesterId) && 
            (project.getFreelancerUserId() == null || !project.getFreelancerUserId().equals(requesterId))) {
            throw new AccessDeniedException("Unauthorized to view this project");
        }
        
        return toDto(project);
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> getProjectsForClient(UUID clientUserId) {
        return projectRepository.findByClientUserId(clientUserId).stream()
                .filter(p -> !p.isDeleted())
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> getProjectsForAssignee(UUID freelancerUserId) {
        return projectRepository.findByFreelancerUserId(freelancerUserId).stream()
                .filter(p -> !p.isDeleted())
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectDto updateProject(UUID projectId, UUID requesterId, UpdateProjectRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        // Authorization check: only project owner (client) can update project details
        if (!project.getClientUserId().equals(requesterId)) {
            throw new AccessDeniedException("Only the project owner can update this project");
        }

        // We use toBuilder to cleanly apply updates to the aggregate
        Project.ProjectBuilder builder = project.toBuilder();
        
        if (request.getTitle() != null) builder.title(request.getTitle());
        if (request.getDescription() != null) builder.description(request.getDescription());
        if (request.getTotalBudgetXlm() != null) builder.totalBudgetXlm(request.getTotalBudgetXlm());
        if (request.getDeadline() != null) builder.deadline(request.getDeadline());
        if (request.getFreelancerUserId() != null) builder.freelancerUserId(request.getFreelancerUserId());
        if (request.getStatus() != null) builder.status(ProjectStatus.valueOf(request.getStatus()));

        Project updatedProject = projectRepository.save(builder.build());
        return toDto(updatedProject);
    }

    @Transactional
    public void deleteProject(UUID projectId, UUID requesterId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        if (!project.getClientUserId().equals(requesterId)) {
            throw new AccessDeniedException("Only the project owner can delete this project");
        }
        
        project.markAsDeleted();
        projectRepository.save(project);
    }
    
    @Transactional
    public ProjectDto archiveProject(UUID projectId, UUID requesterId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        if (!project.getClientUserId().equals(requesterId)) {
            throw new AccessDeniedException("Only the project owner can archive this project");
        }
        
        project.archive();
        Project savedProject = projectRepository.save(project);
        return toDto(savedProject);
    }
    
    @Transactional
    public ProjectDto linkClientWallet(UUID projectId, UUID requesterId, UUID walletId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        if (!project.getClientUserId().equals(requesterId)) {
            throw new AccessDeniedException("Only the client can link the client wallet");
        }

        Wallet wallet = walletRepository.findByIdAndUserId(walletId, requesterId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found or does not belong to user"));

        if (!wallet.isVerified()) {
            throw new IllegalArgumentException("Wallet must be verified before linking");
        }

        project.linkClientWallet(walletId);
        Project savedProject = projectRepository.save(project);
        return toDto(savedProject);
    }
    
    @Transactional
    public void unlinkClientWallet(UUID projectId, UUID requesterId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        if (!project.getClientUserId().equals(requesterId)) {
            throw new AccessDeniedException("Only the client can unlink the client wallet");
        }

        project.unlinkClientWallet();
        projectRepository.save(project);
    }
    
    @Transactional
    public ProjectDto linkFreelancerWallet(UUID projectId, UUID requesterId, UUID walletId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        if (project.getFreelancerUserId() == null || !project.getFreelancerUserId().equals(requesterId)) {
            throw new AccessDeniedException("Only the assigned freelancer can link the freelancer wallet");
        }

        Wallet wallet = walletRepository.findByIdAndUserId(walletId, requesterId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found or does not belong to user"));

        if (!wallet.isVerified()) {
            throw new IllegalArgumentException("Wallet must be verified before linking");
        }

        project.linkFreelancerWallet(walletId);
        Project savedProject = projectRepository.save(project);
        return toDto(savedProject);
    }
    
    @Transactional
    public void unlinkFreelancerWallet(UUID projectId, UUID requesterId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        if (project.getFreelancerUserId() == null || !project.getFreelancerUserId().equals(requesterId)) {
            throw new AccessDeniedException("Only the assigned freelancer can unlink the freelancer wallet");
        }

        project.unlinkFreelancerWallet();
        projectRepository.save(project);
    }

    private ProjectDto toDto(Project project) {
        boolean isEscrowReady = project.isStructurallyReady();
        
        if (isEscrowReady) {
            boolean clientVerified = walletRepository.findByIdAndUserId(project.getClientWalletId(), project.getClientUserId())
                .map(Wallet::isVerified)
                .orElse(false);
                
            boolean freelancerVerified = walletRepository.findByIdAndUserId(project.getFreelancerWalletId(), project.getFreelancerUserId())
                .map(Wallet::isVerified)
                .orElse(false);
                
            isEscrowReady = clientVerified && freelancerVerified;
        }

        return ProjectDto.builder()
                .id(project.getId())
                .clientUserId(project.getClientUserId())
                .clientWalletId(project.getClientWalletId())
                .freelancerUserId(project.getFreelancerUserId())
                .freelancerWalletId(project.getFreelancerWalletId())
                .title(project.getTitle())
                .description(project.getDescription())
                .status(project.getStatus().name())
                .totalBudgetXlm(project.getTotalBudgetXlm())
                .assetCode(project.getAssetCode())
                .deadline(project.getDeadline())
                .isDeleted(project.isDeleted())
                .isEscrowReady(isEscrowReady)
                .build();
    }
}
