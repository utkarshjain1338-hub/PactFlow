package com.pactflow.domain.project;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import com.pactflow.domain.milestone.Milestone;
import com.pactflow.domain.milestone.MilestoneStatus;
import com.pactflow.domain.shared.SoftDeletable;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
public class Project implements SoftDeletable {

    private UUID id;
    private UUID clientUserId;
    private UUID clientWalletId;
    private UUID freelancerUserId;
    private UUID freelancerWalletId;
    private String title;
    private String description;
    private ProjectStatus status;
    private BigDecimal totalBudgetXlm;
    private String assetCode;
    private LocalDate deadline;
    private boolean isDeleted;
    private Instant deletedAt;
    
    @Builder.Default
    private List<Milestone> milestones = new ArrayList<>();

    public static Project create(UUID clientUserId, UUID freelancerUserId, String title, String description, BigDecimal totalBudgetXlm, LocalDate deadline) {
        if (clientUserId == null) {
            throw new IllegalArgumentException("Client User ID is required.");
        }
        if (freelancerUserId != null && clientUserId.equals(freelancerUserId)) {
            throw new IllegalArgumentException("Client and freelancer must be distinct.");
        }
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Title is required.");
        }
        if (totalBudgetXlm == null || totalBudgetXlm.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Total budget must be positive.");
        }
        
        return Project.builder()
                .id(UUID.randomUUID())
                .clientUserId(clientUserId)
                .freelancerUserId(freelancerUserId) // Optional during draft
                .title(title)
                .description(description != null && description.isBlank() ? null : description)
                .status(ProjectStatus.DRAFT)
                .totalBudgetXlm(totalBudgetXlm)
                .assetCode("XLM")
                .deadline(deadline)
                .isDeleted(false)
                .milestones(new ArrayList<>())
                .build();
    }

    public void addMilestone(Milestone milestone) {
        if (!milestone.getProjectId().equals(this.id)) {
            throw new IllegalArgumentException("Milestone does not belong to this project.");
        }
        
        BigDecimal currentTotal = milestones.stream()
                .filter(m -> !m.isDeleted())
                .map(Milestone::getAmountXlm)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        if (currentTotal.add(milestone.getAmountXlm()).compareTo(this.totalBudgetXlm) > 0) {
            throw new IllegalStateException("Milestones total amount exceeds project budget.");
        }
        
        this.milestones.add(milestone);
    }
    
    public void assignFreelancer(UUID freelancerUserId) {
        if (this.clientUserId.equals(freelancerUserId)) {
            throw new IllegalArgumentException("Client and freelancer must be distinct.");
        }
        this.freelancerUserId = freelancerUserId;
    }
    
    public void linkClientWallet(UUID walletId) {
        if (!isWalletMutable()) {
            throw new IllegalStateException("Cannot link client wallet after escrow funding has occurred or project is closed.");
        }
        this.clientWalletId = walletId;
    }
    
    public void unlinkClientWallet() {
        if (!isWalletMutable()) {
            throw new IllegalStateException("Cannot unlink client wallet after escrow funding has occurred or project is closed.");
        }
        this.clientWalletId = null;
    }
    
    public void linkFreelancerWallet(UUID walletId) {
        if (!isWalletMutable()) {
            throw new IllegalStateException("Cannot link freelancer wallet after escrow funding has occurred or project is closed.");
        }
        this.freelancerWalletId = walletId;
    }
    
    public void unlinkFreelancerWallet() {
        if (!isWalletMutable()) {
            throw new IllegalStateException("Cannot unlink freelancer wallet after escrow funding has occurred or project is closed.");
        }
        this.freelancerWalletId = null;
    }

    public List<Milestone> getMilestones() {
        return Collections.unmodifiableList(this.milestones);
    }

    public void markAsDeleted() {
        this.isDeleted = true;
    }
    
    public boolean isWalletMutable() {
        if (this.status == ProjectStatus.ARCHIVED || this.status == ProjectStatus.CANCELLED) {
            return false;
        }
        return this.milestones.stream()
                .noneMatch(m -> !m.isDeleted() && m.getStatus() != MilestoneStatus.DRAFT && m.getStatus() != MilestoneStatus.CANCELLED);
    }
    
    public boolean isStructurallyReady() {
        return this.clientWalletId != null && 
               this.freelancerWalletId != null && 
               this.status == ProjectStatus.ACTIVE;
    }
    
    public void archive() {
        if (this.status == ProjectStatus.ARCHIVED) {
            throw new IllegalStateException("Project is already archived.");
        }
        if (this.status == ProjectStatus.CANCELLED) {
            throw new IllegalStateException("Cannot archive a cancelled project.");
        }
        // Verify all milestones are in terminal state if needed?
        // Let's just allow archiving if they decide to close it.
        this.status = ProjectStatus.ARCHIVED;
    }
}
