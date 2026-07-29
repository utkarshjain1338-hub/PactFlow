package com.pactflow.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "deliverables")
@Getter
@Setter
public class DeliverableJpaEntity {

    @Id
    private UUID id;

    @Column(name = "milestone_id", nullable = false)
    private UUID milestoneId;

    @Column(name = "submitted_by", nullable = false)
    private UUID submittedBy;

    @Column(nullable = false, length = 200)
    private String title;

    private String description;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "repository_url", length = 500)
    private String repositoryUrl;

    @Column(name = "commit_hash", length = 100)
    private String commitHash;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private OffsetDateTime submittedAt;

}
