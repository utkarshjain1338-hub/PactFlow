package com.pactflow.infrastructure.web.controller;

import com.pactflow.application.milestone.MilestoneService;
import com.pactflow.application.milestone.dto.CreateDeliverableRequest;
import com.pactflow.application.milestone.dto.DeliverableDto;
import com.pactflow.application.milestone.dto.CreateMilestoneRequest;
import com.pactflow.application.milestone.dto.MilestoneDto;
import com.pactflow.application.milestone.dto.UpdateMilestoneRequest;
import com.pactflow.application.auth.dto.UserSummaryDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class MilestoneController {

    private final MilestoneService milestoneService;

    public MilestoneController(MilestoneService milestoneService) {
        this.milestoneService = milestoneService;
    }

    @PostMapping("/projects/{projectId}/milestones")
    public ResponseEntity<MilestoneDto> createMilestone(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserSummaryDto user,
            @Valid @RequestBody CreateMilestoneRequest request) {
        
        MilestoneDto milestone = milestoneService.createMilestone(projectId, request, user.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(milestone);
    }

    @GetMapping("/projects/{projectId}/milestones")
    public ResponseEntity<List<MilestoneDto>> getProjectMilestones(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserSummaryDto user) {
        
        List<MilestoneDto> milestones = milestoneService.getMilestonesForProject(projectId, user.id());
        return ResponseEntity.ok(milestones);
    }


    @PatchMapping("/projects/{projectId}/milestones/{milestoneId}")
    public ResponseEntity<MilestoneDto> updateMilestone(
            @PathVariable UUID projectId,
            @PathVariable UUID milestoneId,
            @AuthenticationPrincipal UserSummaryDto user,
            @Valid @RequestBody UpdateMilestoneRequest request) {
            
        MilestoneDto milestone = milestoneService.updateMilestone(projectId, milestoneId, request, user.id());
        return ResponseEntity.ok(milestone);
    }
    
    @DeleteMapping("/projects/{projectId}/milestones/{milestoneId}")
    public ResponseEntity<Void> deleteMilestone(
            @PathVariable UUID projectId,
            @PathVariable UUID milestoneId,
            @AuthenticationPrincipal UserSummaryDto user) {
            
        milestoneService.deleteMilestone(projectId, milestoneId, user.id());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/projects/{projectId}/milestones/{milestoneId}/submit")
    public ResponseEntity<DeliverableDto> submitDeliverable(
            @PathVariable UUID projectId,
            @PathVariable UUID milestoneId,
            @AuthenticationPrincipal UserSummaryDto user,
            @Valid @RequestBody CreateDeliverableRequest request) {
            
        DeliverableDto deliverable = milestoneService.submitDeliverable(projectId, milestoneId, request, user.id());
        return ResponseEntity.ok(deliverable);
    }

    @PostMapping("/projects/{projectId}/milestones/{milestoneId}/review")
    public ResponseEntity<Void> markInReview(
            @PathVariable UUID projectId,
            @PathVariable UUID milestoneId,
            @AuthenticationPrincipal UserSummaryDto user) {
            
        milestoneService.markInReview(projectId, milestoneId, user.id());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/projects/{projectId}/milestones/{milestoneId}/approve")
    public ResponseEntity<Void> approveMilestone(
            @PathVariable UUID projectId,
            @PathVariable UUID milestoneId,
            @AuthenticationPrincipal UserSummaryDto user) {
            
        milestoneService.approveMilestone(projectId, milestoneId, user.id());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/projects/{projectId}/milestones/{milestoneId}/reject")
    public ResponseEntity<Void> rejectMilestone(
            @PathVariable UUID projectId,
            @PathVariable UUID milestoneId,
            @AuthenticationPrincipal UserSummaryDto user) {
            
        milestoneService.rejectMilestone(projectId, milestoneId, user.id());
        return ResponseEntity.ok().build();
    }
}
