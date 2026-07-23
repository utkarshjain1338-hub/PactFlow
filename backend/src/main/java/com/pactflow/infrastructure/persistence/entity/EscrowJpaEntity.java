package com.pactflow.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "escrows")
@Getter
@Setter
public class EscrowJpaEntity {

    @Id
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "milestone_id", nullable = false, unique = true)
    private UUID milestoneId;

    @Column(name = "contract_id", length = 100)
    private String contractId;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(name = "funded_amount", nullable = false, precision = 20, scale = 7)
    private BigDecimal fundedAmount = BigDecimal.ZERO;

    @Column(name = "funded_at")
    private Instant fundedAt;

    @Column(name = "released_at")
    private Instant releasedAt;

    @Column(name = "refunded_at")
    private Instant refundedAt;

    @Column(name = "transaction_references")
    private String transactionReferences;

    @Version
    @Column(nullable = false)
    private Long version = 1L;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
