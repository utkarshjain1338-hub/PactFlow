package com.pactflow.application.milestone.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class DeliverableDto {
    private UUID id;
    private UUID milestoneId;
    private UUID submittedBy;
    private String title;
    private String description;
    private String fileUrl;
    private String repositoryUrl;
    private String commitHash;
    private String status;
    private OffsetDateTime submittedAt;
}
