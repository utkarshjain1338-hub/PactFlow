package com.pactflow.application.milestone;

import com.pactflow.application.milestone.dto.CreateMilestoneRequest;
import com.pactflow.application.milestone.dto.MilestoneDto;
import com.pactflow.application.milestone.dto.UpdateMilestoneRequest;
import com.pactflow.application.milestone.dto.CreateDeliverableRequest;
import com.pactflow.application.milestone.dto.DeliverableDto;
import com.pactflow.domain.deliverable.Deliverable;
import com.pactflow.domain.deliverable.DeliverableRepository;
import com.pactflow.domain.escrow.Escrow;
import com.pactflow.domain.escrow.EscrowRepository;
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
    private final DeliverableRepository deliverableRepository;
    private final EscrowRepository escrowRepository;
    private final ApplicationEventPublisher eventPublisher;

    public MilestoneService(ProjectRepository projectRepository, 
                            DeliverableRepository deliverableRepository, 
                            EscrowRepository escrowRepository, 
                            ApplicationEventPublisher eventPublisher) {
        this.projectRepository = projectRepository;
        this.deliverableRepository = deliverableRepository;
        this.escrowRepository = escrowRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Creates a milestone.
     *
     * @param projectId   the project ID
     * @param request     the create milestone request
     * @param requesterId the requester ID
     * @return the milestone DTO
     */
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

    /**
     * Gets milestones for a project.
     *
     * @param projectId   the project ID
     * @param requesterId the requester ID
     * @return the list of milestone DTOs
     */
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


    /**
     * Updates a milestone.
     *
     * @param projectId   the project ID
     * @param milestoneId the milestone ID
     * @param request     the update request
     * @param requesterId the requester ID
     * @return the updated milestone DTO
     */
    @Transactional
    public MilestoneDto updateMilestone(
            UUID projectId, UUID milestoneId, UpdateMilestoneRequest request, UUID requesterId) {
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
        if (request.getTitle() != null) {
            builder.title(request.getTitle());
        }
        if (request.getDescription() != null) {
            builder.description(request.getDescription());
        }
        if (request.getAmountXlm() != null) {
            builder.amountXlm(request.getAmountXlm());
        }
        if (request.getSequenceOrder() != null) {
            builder.sequenceOrder(request.getSequenceOrder());
        }
        if (request.getDueDate() != null) {
            builder.dueDate(request.getDueDate());
        }
        if (request.getStrictDeadline() != null) {
            builder.isStrictDeadline(request.getStrictDeadline());
        }
        
        Milestone updatedMilestone = builder.build();
        
        // Temporarily reset project milestones to re-add and trigger aggregate validation
        Project projectWithRemovedMilestone = project.toBuilder().milestones(mutableMilestones).build();
        projectWithRemovedMilestone.addMilestone(updatedMilestone);
        
        projectRepository.save(projectWithRemovedMilestone);
        
        return toDto(updatedMilestone);
    }
    
    /**
     * Deletes a milestone.
     *
     * @param projectId   the project ID
     * @param milestoneId the milestone ID
     * @param requesterId the requester ID
     */
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

    /**
     * Submits a deliverable.
     *
     * @param projectId   the project ID
     * @param milestoneId the milestone ID
     * @param request     the create deliverable request
     * @param requesterId the requester ID
     * @return the deliverable DTO
     */
    @Transactional
    public DeliverableDto submitDeliverable(
            UUID projectId, UUID milestoneId, CreateDeliverableRequest request, UUID requesterId) {
        Project project = getProject(projectId);
        if (project.getFreelancerUserId() == null || !requesterId.equals(project.getFreelancerUserId())) {
            throw new AccessDeniedException("Only the assigned freelancer can submit deliverables.");
        }
        
        Milestone milestone = getMilestone(project, milestoneId);
        milestone.submitWork();
        
        Deliverable deliverable = Deliverable.submit(
            milestoneId, requesterId, request.getTitle(), request.getDescription(),
            request.getFileUrl(), request.getRepositoryUrl(), request.getCommitHash()
        );
        deliverable = deliverableRepository.save(deliverable);
        
        Escrow escrow = getEscrowForMilestone(milestoneId);
        if (escrow != null) {
            escrow.submitWork();
            escrowRepository.save(escrow);
        }
        
        // Updating milestone within project
        updateMilestoneInProject(project, milestone);
        
        return toDeliverableDto(deliverable);
    }

    /**
     * Marks a milestone in review.
     *
     * @param projectId   the project ID
     * @param milestoneId the milestone ID
     * @param requesterId the requester ID
     */
    @Transactional
    public void markInReview(UUID projectId, UUID milestoneId, UUID requesterId) {
        Project project = getProject(projectId);
        if (!requesterId.equals(project.getClientUserId())) {
            throw new AccessDeniedException("Only the client can mark as in review.");
        }
        
        Milestone milestone = getMilestone(project, milestoneId);
        milestone.startReview();
        
        Escrow escrow = getEscrowForMilestone(milestoneId);
        if (escrow != null) {
            escrow.startReview();
            escrowRepository.save(escrow);
        }
        updateMilestoneInProject(project, milestone);
    }

    /**
     * Approves a milestone.
     *
     * @param projectId   the project ID
     * @param milestoneId the milestone ID
     * @param requesterId the requester ID
     */
    @Transactional
    public void approveMilestone(UUID projectId, UUID milestoneId, UUID requesterId) {
        Project project = getProject(projectId);
        if (!requesterId.equals(project.getClientUserId())) {
            throw new AccessDeniedException("Only the client can approve a milestone.");
        }
        
        Milestone milestone = getMilestone(project, milestoneId);
        milestone.approveWork();
        
        deliverableRepository.findByMilestoneId(milestoneId).forEach(d -> {
            if (d.getStatus() == com.pactflow.domain.deliverable.DeliverableStatus.SUBMITTED) {
                d.accept();
                deliverableRepository.save(d);
            }
        });
        
        Escrow escrow = getEscrowForMilestone(milestoneId);
        if (escrow != null) {
            escrow.approve();
            escrowRepository.save(escrow);
        }
        updateMilestoneInProject(project, milestone);
    }

    /**
     * Rejects a milestone.
     *
     * @param projectId   the project ID
     * @param milestoneId the milestone ID
     * @param requesterId the requester ID
     */
    @Transactional
    public void rejectMilestone(UUID projectId, UUID milestoneId, UUID requesterId) {
        Project project = getProject(projectId);
        if (!requesterId.equals(project.getClientUserId())) {
            throw new AccessDeniedException("Only the client can reject a milestone.");
        }
        
        Milestone milestone = getMilestone(project, milestoneId);
        milestone.rejectWork();
        
        deliverableRepository.findByMilestoneId(milestoneId).forEach(d -> {
            if (d.getStatus() == com.pactflow.domain.deliverable.DeliverableStatus.SUBMITTED) {
                d.reject();
                deliverableRepository.save(d);
            }
        });
        
        updateMilestoneInProject(project, milestone);
    }

    /**
     * Completes a milestone.
     *
     * @param projectId   the project ID
     * @param milestoneId the milestone ID
     */
    @Transactional
    public void completeMilestone(UUID projectId, UUID milestoneId) {
        Project project = getProject(projectId);
        Milestone milestone = getMilestone(project, milestoneId);
        milestone.markAsPaid();
        updateMilestoneInProject(project, milestone);
    }

    private Project getProject(UUID projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));
    }
    
    private Milestone getMilestone(Project project, UUID milestoneId) {
        return project.getMilestones().stream()
                .filter(m -> m.getId().equals(milestoneId) && !m.isDeleted())
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Milestone not found"));
    }
    
    private Escrow getEscrowForMilestone(UUID milestoneId) {
        return escrowRepository.findByMilestoneId(milestoneId).orElse(null);
    }
    
    private void updateMilestoneInProject(Project project, Milestone milestone) {
        List<Milestone> mutableMilestones = new java.util.ArrayList<>(project.getMilestones());
        mutableMilestones.removeIf(m -> m.getId().equals(milestone.getId()));
        mutableMilestones.add(milestone);
        projectRepository.save(project.toBuilder().milestones(mutableMilestones).build());
    }

    private DeliverableDto toDeliverableDto(Deliverable deliverable) {
        return DeliverableDto.builder()
                .id(deliverable.getId())
                .milestoneId(deliverable.getMilestoneId())
                .submittedBy(deliverable.getSubmittedBy())
                .title(deliverable.getTitle())
                .description(deliverable.getDescription())
                .fileUrl(deliverable.getFileUrl())
                .repositoryUrl(deliverable.getRepositoryUrl())
                .commitHash(deliverable.getCommitHash())
                .status(deliverable.getStatus().name())
                .submittedAt(deliverable.getSubmittedAt())
                .build();
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
