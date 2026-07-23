package com.pactflow.infrastructure.persistence.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import jakarta.persistence.FetchType;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "projects")
@Getter
@Setter
public class ProjectJpaEntity {

    @Id
    private UUID id;

    @Column(name = "client_user_id", nullable = false)
    private UUID clientUserId;

    @Column(name = "client_wallet_id")
    private UUID clientWalletId;

    @Column(name = "freelancer_user_id")
    private UUID freelancerUserId;

    @Column(name = "freelancer_wallet_id")
    private UUID freelancerWalletId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 5000)
    private String description;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "total_budget_xlm", nullable = false, precision = 20, scale = 7)
    private BigDecimal totalBudgetXlm;

    @Column(name = "asset_code", nullable = false, length = 12)
    private String assetCode = "XLM";

    @Column(name = "deadline")
    private LocalDate deadline;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id")
    private List<MilestoneJpaEntity> milestones = new ArrayList<>();

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Version
    @Column(nullable = false)
    private Long version = 1L;

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
