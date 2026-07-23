package com.pactflow.application.milestone;

import com.pactflow.application.milestone.dto.CreateMilestoneRequest;
import com.pactflow.application.milestone.dto.MilestoneDto;
import com.pactflow.application.milestone.dto.UpdateMilestoneRequest;
import com.pactflow.domain.milestone.Milestone;
import com.pactflow.domain.milestone.MilestoneStatus;
import com.pactflow.domain.project.Project;
import com.pactflow.domain.project.ProjectRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MilestoneService {

    private final ProjectRepository projectRepository;
    private final ApplicationEventPublisher eventPublisher;

    public MilestoneService(ProjectRepository projectRepository, ApplicationEventPublisher eventPublisher) {
        this.projectRepository = projectRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public MilestoneDto createMilestone(UUID projectId, CreateMilestoneRequest request, UUID requesterId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        
        if (!project.getClientUserId().equals(requesterId)) {
            throw new AccessDeniedException("Only the project owner can add milestones.");
        }

        Milestone milestone = Milestone.create(
                projectId,
                request.getTitle(),
                request.getDescription(),
                request.getAmountXlm(),
                request.getSequenceOrder(),
                request.getDueDate(),
                request.isStrictDeadline()
        );

        // This checks if the budget is exceeded
        project.addMilestone(milestone);
        
        // Save the aggregate root (which cascades to milestones)
        Project savedProject = projectRepository.save(project);
        
        // Find the saved milestone (id is generated locally so it should match)
        Milestone savedMilestone = savedProject.getMilestones().stream()
                .filter(m -> m.getId().equals(milestone.getId()))
                .findFirst()
                .orElseThrow();

        return toDto(savedMilestone);
    }

    @Transactional(readOnly = true)
    public List<MilestoneDto> getMilestonesForProject(UUID projectId, UUID requesterId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        
        if (!project.getClientUserId().equals(requesterId) && 
            (project.getFreelancerUserId() == null || !project.getFreelancerUserId().equals(requesterId))) {
            throw new AccessDeniedException("Unauthorized to view this project's milestones");
        }

        return project.getMilestones().stream()
                .filter(m -> !m.isDeleted())
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public MilestoneDto getMilestone(UUID milestoneId, UUID requesterId) {
        // Since milestone doesn't have a standalone repository read endpoint, 
        // we'd typically need a custom query in the project repo to find the project by milestone ID,
        // or just add a read-only MilestoneRepository for fetching. 
        // For simplicity, assuming the Controller passes projectId as part of the URI, or we use a separate read repo.
        throw new UnsupportedOperationException("Not implemented yet. Please use getMilestonesForProject instead.");
    }

    @Transactional
    public MilestoneDto updateMilestone(UUID projectId, UUID milestoneId, UpdateMilestoneRequest request, UUID requesterId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
                
        if (!project.getClientUserId().equals(requesterId)) {
            throw new AccessDeniedException("Only the project owner can update milestones.");
        }
        
        Milestone milestone = project.getMilestones().stream()
                .filter(m -> m.getId().equals(milestoneId) && !m.isDeleted())
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Milestone not found"));
                
        if (milestone.getStatus() != MilestoneStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT milestones can be updated.");
        }
        
        // Need to remove old, update, and re-add to check invariants
        List<Milestone> mutableMilestones = new java.util.ArrayList<>(project.getMilestones());
        mutableMilestones.remove(milestone);
        
        Milestone.MilestoneBuilder builder = milestone.toBuilder();
        if (request.getTitle() != null) builder.title(request.getTitle());
        if (request.getDescription() != null) builder.description(request.getDescription());
        if (request.getAmountXlm() != null) builder.amountXlm(request.getAmountXlm());
        if (request.getSequenceOrder() != null) builder.sequenceOrder(request.getSequenceOrder());
        if (request.getDueDate() != null) builder.dueDate(request.getDueDate());
        if (request.getStrictDeadline() != null) builder.isStrictDeadline(request.getStrictDeadline());
        
        Milestone updatedMilestone = builder.build();
        
        // Temporarily reset project milestones to re-add and trigger aggregate validation
        Project projectWithRemovedMilestone = project.toBuilder().milestones(mutableMilestones).build();
        projectWithRemovedMilestone.addMilestone(updatedMilestone);
        
        projectRepository.save(projectWithRemovedMilestone);
        
        return toDto(updatedMilestone);
    }
    
    @Transactional
    public void deleteMilestone(UUID projectId, UUID milestoneId, UUID requesterId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
                
        if (!project.getClientUserId().equals(requesterId)) {
            throw new AccessDeniedException("Only the project owner can delete milestones.");
        }
        
        Milestone milestone = project.getMilestones().stream()
                .filter(m -> m.getId().equals(milestoneId) && !m.isDeleted())
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Milestone not found"));
                
        if (milestone.getStatus() != MilestoneStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT milestones can be deleted.");
        }
        
        // We use builder to apply soft delete
        Milestone deletedMilestone = milestone.toBuilder().isDeleted(true).build();
        
        List<Milestone> mutableMilestones = new java.util.ArrayList<>(project.getMilestones());
        mutableMilestones.remove(milestone);
        mutableMilestones.add(deletedMilestone);
        
        projectRepository.save(project.toBuilder().milestones(mutableMilestones).build());
    }

    private MilestoneDto toDto(Milestone milestone) {
        return MilestoneDto.builder()
                .id(milestone.getId())
                .projectId(milestone.getProjectId())
                .title(milestone.getTitle())
                .description(milestone.getDescription())
                .amountXlm(milestone.getAmountXlm())
                .assetCode(milestone.getAssetCode())
                .status(milestone.getStatus().name())
                .sequenceOrder(milestone.getSequenceOrder())
                .dueDate(milestone.getDueDate())
                .isStrictDeadline(milestone.isStrictDeadline())
                .isDeleted(milestone.isDeleted())
                .build();
    }
}
