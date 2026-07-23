package com.pactflow.domain.deliverable;

import java.time.OffsetDateTime;
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
public class Deliverable {

    private UUID id;
    private UUID milestoneId;
    private UUID submittedBy;
    private String title;
    private String description;
    private String fileUrl;
    private String repositoryUrl;
    private String commitHash;
    private OffsetDateTime submittedAt;
    private DeliverableStatus status;

    public static Deliverable submit(UUID milestoneId, UUID submittedBy, String title, String description, String fileUrl, String repositoryUrl, String commitHash) {
        if (milestoneId == null || submittedBy == null) {
            throw new IllegalArgumentException("Milestone ID and Submitted By are required.");
        }
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Title is required.");
        }
        
        return Deliverable.builder()
                .id(UUID.randomUUID())
                .milestoneId(milestoneId)
                .submittedBy(submittedBy)
                .title(title)
                .description(description)
                .fileUrl(fileUrl)
                .repositoryUrl(repositoryUrl)
                .commitHash(commitHash)
                .submittedAt(OffsetDateTime.now())
                .status(DeliverableStatus.SUBMITTED)
                .build();
    }
    
    public void accept() {
        if (this.status != DeliverableStatus.SUBMITTED) {
            throw new IllegalStateException("Only submitted deliverables can be accepted.");
        }
        this.status = DeliverableStatus.ACCEPTED;
    }
    
    public void reject() {
        if (this.status != DeliverableStatus.SUBMITTED) {
            throw new IllegalStateException("Only submitted deliverables can be rejected.");
        }
        this.status = DeliverableStatus.REJECTED;
    }
}
