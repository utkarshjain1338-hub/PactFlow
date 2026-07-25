package com.pactflow.infrastructure.web.controller;

import com.pactflow.application.milestone.MilestoneService;
import com.pactflow.application.milestone.dto.CreateDeliverableRequest;
import com.pactflow.application.milestone.dto.DeliverableDto;
import com.pactflow.application.milestone.dto.CreateMilestoneRequest;
import com.pactflow.application.milestone.dto.MilestoneDto;
import com.pactflow.application.milestone.dto.UpdateMilestoneRequest;
import com.pactflow.domain.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class MilestoneController {

    private final MilestoneService milestoneService;

    public MilestoneController(MilestoneService milestoneService) {
        this.milestoneService = milestoneService;
    }

    @PostMapping("/projects/{projectId}/milestones")
    public ResponseEntity<MilestoneDto> createMilestone(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateMilestoneRequest request) {
        
        MilestoneDto milestone = milestoneService.createMilestone(projectId, request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(milestone);
    }

    @GetMapping("/projects/{projectId}/milestones")
    public ResponseEntity<List<MilestoneDto>> getProjectMilestones(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal User user) {
        
        List<MilestoneDto> milestones = milestoneService.getMilestonesForProject(projectId, user.getId());
        return ResponseEntity.ok(milestones);
    }


    @PatchMapping("/projects/{projectId}/milestones/{milestoneId}")
    public ResponseEntity<MilestoneDto> updateMilestone(
            @PathVariable UUID projectId,
            @PathVariable UUID milestoneId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateMilestoneRequest request) {
            
        MilestoneDto milestone = milestoneService.updateMilestone(projectId, milestoneId, request, user.getId());
        return ResponseEntity.ok(milestone);
    }
    
    @DeleteMapping("/projects/{projectId}/milestones/{milestoneId}")
    public ResponseEntity<Void> deleteMilestone(
            @PathVariable UUID projectId,
            @PathVariable UUID milestoneId,
            @AuthenticationPrincipal User user) {
            
        milestoneService.deleteMilestone(projectId, milestoneId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/projects/{projectId}/milestones/{milestoneId}/submit")
    public ResponseEntity<DeliverableDto> submitDeliverable(
            @PathVariable UUID projectId,
            @PathVariable UUID milestoneId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateDeliverableRequest request) {
            
        DeliverableDto deliverable = milestoneService.submitDeliverable(projectId, milestoneId, request, user.getId());
        return ResponseEntity.ok(deliverable);
    }

    @PostMapping("/projects/{projectId}/milestones/{milestoneId}/review")
    public ResponseEntity<Void> markInReview(
            @PathVariable UUID projectId,
            @PathVariable UUID milestoneId,
            @AuthenticationPrincipal User user) {
            
        milestoneService.markInReview(projectId, milestoneId, user.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/projects/{projectId}/milestones/{milestoneId}/approve")
    public ResponseEntity<Void> approveMilestone(
            @PathVariable UUID projectId,
            @PathVariable UUID milestoneId,
            @AuthenticationPrincipal User user) {
            
        milestoneService.approveMilestone(projectId, milestoneId, user.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/projects/{projectId}/milestones/{milestoneId}/reject")
    public ResponseEntity<Void> rejectMilestone(
            @PathVariable UUID projectId,
            @PathVariable UUID milestoneId,
            @AuthenticationPrincipal User user) {
            
        milestoneService.rejectMilestone(projectId, milestoneId, user.getId());
        return ResponseEntity.ok().build();
    }
}
