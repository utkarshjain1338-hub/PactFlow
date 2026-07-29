package com.pactflow.domain.escrow;

import java.math.BigDecimal;
import java.time.Instant;
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
public class Escrow {

    private UUID id;
    private Long version;
    private UUID projectId;
    private UUID milestoneId;
    private String contractId; // nullable, for Soroban
    private EscrowStatus status;
    private BigDecimal fundedAmount;
    private Instant fundedAt;
    private Instant releasedAt;
    private Instant refundedAt;
    private String transactionReferences; // stored as JSON or CSV string for now

    /**
     * Creates a new escrow.
     *
     * @param projectId the project ID
     * @param milestoneId the milestone ID
     * @return the new escrow
     */
    public static Escrow create(UUID projectId, UUID milestoneId) {
        if (projectId == null) {
            throw new IllegalArgumentException("Project ID is required.");
        }
        if (milestoneId == null) {
            throw new IllegalArgumentException("Milestone ID is required.");
        }

        return Escrow.builder()
                .id(UUID.randomUUID())
                .projectId(projectId)
                .milestoneId(milestoneId)
                .status(EscrowStatus.CREATED)
                .fundedAmount(BigDecimal.ZERO)
                .build();
    }

    /**
     * Initiates funding for the escrow.
     */
    public void initiateFunding() {
        if (this.status != EscrowStatus.CREATED) {
            throw new IllegalStateException("Cannot initiate funding from status " + this.status);
        }
        this.status = EscrowStatus.PENDING_FUNDING;
    }

    /**
     * Marks the escrow as funded.
     *
     * @param amount the funded amount
     * @param txRef the transaction reference
     */
    public void markFunded(BigDecimal amount, String txRef) {
        if (this.status != EscrowStatus.PENDING_FUNDING) {
            throw new IllegalStateException("Cannot mark as funded from status " + this.status);
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Funded amount must be positive.");
        }
        this.status = EscrowStatus.FUNDED;
        this.fundedAmount = amount;
        this.fundedAt = Instant.now();
        addTransactionReference(txRef);
    }

    /**
     * Submits the work for review.
     */
    public void submitWork() {
        if (this.status != EscrowStatus.FUNDED) {
            throw new IllegalStateException("Cannot submit work from status " + this.status);
        }
        this.status = EscrowStatus.SUBMITTED;
    }

    /**
     * Starts the review process.
     */
    public void startReview() {
        if (this.status != EscrowStatus.SUBMITTED) {
            throw new IllegalStateException("Cannot start review from status " + this.status);
        }
        this.status = EscrowStatus.UNDER_REVIEW;
    }

    /**
     * Approves the submitted work.
     */
    public void approve() {
        if (this.status != EscrowStatus.UNDER_REVIEW) {
            throw new IllegalStateException("Cannot approve from status " + this.status);
        }
        this.status = EscrowStatus.APPROVED;
    }

    /**
     * Disputes the submitted work.
     */
    public void dispute() {
        if (this.status != EscrowStatus.UNDER_REVIEW) {
            throw new IllegalStateException("Cannot dispute from status " + this.status);
        }
        this.status = EscrowStatus.DISPUTED;
    }

    /**
     * Releases funds to the freelancer.
     *
     * @param txRef the transaction reference
     */
    public void release(String txRef) {
        if (this.status != EscrowStatus.APPROVED && this.status != EscrowStatus.DISPUTED) {
            throw new IllegalStateException("Cannot release funds from status " + this.status);
        }
        this.status = EscrowStatus.RELEASED;
        this.releasedAt = Instant.now();
        addTransactionReference(txRef);
    }

    /**
     * Refunds the escrow to the client.
     *
     * @param txRef the transaction reference
     */
    public void refund(String txRef) {
        if (this.status != EscrowStatus.FUNDED && this.status != EscrowStatus.DISPUTED) {
            throw new IllegalStateException("Cannot refund from status " + this.status);
        }
        this.status = EscrowStatus.REFUNDED;
        this.refundedAt = Instant.now();
        addTransactionReference(txRef);
    }
    
    /**
     * Marks the escrow as failed.
     */
    public void markFailed() {
        if (this.status == EscrowStatus.RELEASED || this.status == EscrowStatus.REFUNDED) {
            throw new IllegalStateException("Cannot fail an escrow that has already been resolved.");
        }
        this.status = EscrowStatus.FAILED;
    }

    private void addTransactionReference(String txRef) {
        if (txRef == null || txRef.isBlank()) {
            return;
        }
        
        if (this.transactionReferences == null || this.transactionReferences.isBlank()) {
            this.transactionReferences = txRef;
        } else {
            this.transactionReferences += "," + txRef;
        }
    }
}
