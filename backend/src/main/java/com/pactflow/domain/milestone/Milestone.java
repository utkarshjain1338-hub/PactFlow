package com.pactflow.domain.milestone;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
public class Milestone {

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

    public static Milestone create(UUID projectId, String title, String description, BigDecimal amountXlm, Integer sequenceOrder, LocalDate dueDate, boolean isStrictDeadline) {
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

    public void markAsFunded() {
        if (this.status != MilestoneStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT milestones can be FUNDED");
        }
        this.status = MilestoneStatus.FUNDED;
    }

    public void markAsInProgress() {
        if (this.status != MilestoneStatus.FUNDED) {
            throw new IllegalStateException("Only FUNDED milestones can move to IN_PROGRESS");
        }
        this.status = MilestoneStatus.IN_PROGRESS;
    }

    public void submitWork() {
        if (this.status != MilestoneStatus.IN_PROGRESS) {
            throw new IllegalStateException("Only IN_PROGRESS milestones can be SUBMITTED");
        }
        this.status = MilestoneStatus.SUBMITTED;
    }

    public void approveWork() {
        if (this.status != MilestoneStatus.SUBMITTED) {
            throw new IllegalStateException("Only SUBMITTED milestones can be APPROVED");
        }
        this.status = MilestoneStatus.APPROVED;
    }

    public void markAsPaid() {
        if (this.status != MilestoneStatus.APPROVED) {
            throw new IllegalStateException("Only APPROVED milestones can be PAID");
        }
        this.status = MilestoneStatus.PAID;
    }

    public void refund() {
        if (this.status == MilestoneStatus.PAID) {
            throw new IllegalStateException("Cannot refund a PAID milestone");
        }
        this.status = MilestoneStatus.REFUNDED;
    }
}
