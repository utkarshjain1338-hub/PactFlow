package com.pactflow.domain.milestone;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.pactflow.domain.shared.SoftDeletable;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
public class Milestone implements SoftDeletable {

    private UUID id;
    private UUID projectId;
    private String title;
    private String description;
    private BigDecimal amountXlm;
    private String assetCode;
    private MilestoneStatus status;
    private Integer sequenceOrder;
    private LocalDate dueDate;
    private boolean isStrictDeadline;
    private boolean isDeleted;
    private Instant deletedAt;

    /**
     * Creates a new milestone.
     *
     * @param projectId the project ID
     * @param title the milestone title
     * @param description the milestone description
     * @param amountXlm the amount in XLM
     * @param sequenceOrder the sequence order
     * @param dueDate the due date
     * @param isStrictDeadline whether the deadline is strict
     * @return the created milestone
     */
    public static Milestone create(
            UUID projectId, 
            String title, 
            String description, 
            BigDecimal amountXlm, 
            Integer sequenceOrder, 
            LocalDate dueDate, 
            boolean isStrictDeadline) {
        if (projectId == null) {
            throw new IllegalArgumentException("Project ID must not be null.");
        }
        if (amountXlm == null || amountXlm.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive.");
        }
        if (sequenceOrder == null || sequenceOrder < 1) {
            throw new IllegalArgumentException("Sequence order must be 1 or greater.");
        }

        return Milestone.builder()
                .id(UUID.randomUUID())
                .projectId(projectId)
                .title(title)
                .description(description)
                .amountXlm(amountXlm)
                .assetCode("XLM")
                .status(MilestoneStatus.DRAFT)
                .sequenceOrder(sequenceOrder)
                .dueDate(dueDate)
                .isStrictDeadline(isStrictDeadline)
                .isDeleted(false)
                .build();
    }

    /**
     * Marks the milestone as funded.
     */
    public void markAsFunded() {
        if (this.status != MilestoneStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT milestones can be FUNDED");
        }
        this.status = MilestoneStatus.FUNDED;
    }

    /**
     * Marks the milestone as in progress.
     */
    public void markAsInProgress() {
        if (this.status != MilestoneStatus.FUNDED 
                && this.status != MilestoneStatus.UNDER_REVIEW 
                && this.status != MilestoneStatus.SUBMITTED) {
            throw new IllegalStateException("Only FUNDED or rejected milestones can move to IN_PROGRESS");
        }
        this.status = MilestoneStatus.IN_PROGRESS;
    }

    /**
     * Submits the work for the milestone.
     */
    public void submitWork() {
        if (this.status != MilestoneStatus.IN_PROGRESS) {
            throw new IllegalStateException("Only IN_PROGRESS milestones can be SUBMITTED");
        }
        this.status = MilestoneStatus.SUBMITTED;
    }

    /**
     * Starts the review process.
     */
    public void startReview() {
        if (this.status != MilestoneStatus.SUBMITTED) {
            throw new IllegalStateException("Only SUBMITTED milestones can start review");
        }
        this.status = MilestoneStatus.UNDER_REVIEW;
    }

    /**
     * Rejects the submitted work.
     */
    public void rejectWork() {
        if (this.status != MilestoneStatus.UNDER_REVIEW && this.status != MilestoneStatus.SUBMITTED) {
            throw new IllegalStateException("Only SUBMITTED or UNDER_REVIEW milestones can be rejected");
        }
        this.status = MilestoneStatus.IN_PROGRESS;
    }

    /**
     * Approves the submitted work.
     */
    public void approveWork() {
        if (this.status != MilestoneStatus.SUBMITTED && this.status != MilestoneStatus.UNDER_REVIEW) {
            throw new IllegalStateException("Only SUBMITTED or UNDER_REVIEW milestones can be APPROVED");
        }
        this.status = MilestoneStatus.APPROVED;
    }

    /**
     * Marks the milestone as paid.
     */
    public void markAsPaid() {
        if (this.status != MilestoneStatus.APPROVED) {
            throw new IllegalStateException("Only APPROVED milestones can be PAID");
        }
        this.status = MilestoneStatus.PAID;
    }

    /**
     * Refunds the milestone.
     */
    public void refund() {
        if (this.status == MilestoneStatus.PAID) {
            throw new IllegalStateException("Cannot refund a PAID milestone");
        }
        if (this.status == MilestoneStatus.REFUNDED) {
            throw new IllegalStateException("Milestone is already REFUNDED");
        }
        this.status = MilestoneStatus.REFUNDED;
    }
}
