package com.pactflow.infrastructure.web.controller;

import com.pactflow.application.project.ProjectService;
import com.pactflow.application.project.dto.CreateProjectRequest;
import com.pactflow.application.project.dto.LinkWalletRequest;
import com.pactflow.application.project.dto.ProjectDto;
import com.pactflow.application.project.dto.UpdateProjectRequest;
import com.pactflow.application.auth.dto.UserSummaryDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public ResponseEntity<ProjectDto> createProject(
            @AuthenticationPrincipal UserSummaryDto user,
            @Valid @RequestBody CreateProjectRequest request) {
        
        ProjectDto project = projectService.createProject(user.id(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(project);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProject(
            @AuthenticationPrincipal UserSummaryDto user,
            @PathVariable UUID id) {
        
        ProjectDto project = projectService.getProject(id, user.id());
        return ResponseEntity.ok(project);
    }

    @GetMapping
    public ResponseEntity<List<ProjectDto>> getMyProjects(@AuthenticationPrincipal UserSummaryDto user) {
        List<ProjectDto> asClient = projectService.getProjectsForClient(user.id());
        List<ProjectDto> asAssignee = projectService.getProjectsForAssignee(user.id());
        
        // Merge lists
        asClient.addAll(asAssignee);
        return ResponseEntity.ok(asClient);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProjectDto> updateProject(
            @AuthenticationPrincipal UserSummaryDto user,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProjectRequest request) {
            
        ProjectDto project = projectService.updateProject(id, user.id(), request);
        return ResponseEntity.ok(project);
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<ProjectDto> archiveProject(
            @AuthenticationPrincipal UserSummaryDto user,
            @PathVariable UUID id) {
            
        ProjectDto project = projectService.archiveProject(id, user.id());
        return ResponseEntity.ok(project);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @AuthenticationPrincipal UserSummaryDto user,
            @PathVariable UUID id) {
            
        projectService.deleteProject(id, user.id());
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/client-wallet")
    public ResponseEntity<ProjectDto> linkClientWallet(
            @AuthenticationPrincipal UserSummaryDto user,
            @PathVariable UUID id,
            @Valid @RequestBody LinkWalletRequest request) {
            
        ProjectDto project = projectService.linkClientWallet(id, user.id(), request.getWalletId());
        return ResponseEntity.ok(project);
    }
    
    @DeleteMapping("/{id}/client-wallet")
    public ResponseEntity<Void> unlinkClientWallet(
            @AuthenticationPrincipal UserSummaryDto user,
            @PathVariable UUID id) {
            
        projectService.unlinkClientWallet(id, user.id());
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/freelancer-wallet")
    public ResponseEntity<ProjectDto> linkFreelancerWallet(
            @AuthenticationPrincipal UserSummaryDto user,
            @PathVariable UUID id,
            @Valid @RequestBody LinkWalletRequest request) {
            
        ProjectDto project = projectService.linkFreelancerWallet(id, user.id(), request.getWalletId());
        return ResponseEntity.ok(project);
    }
    
    @DeleteMapping("/{id}/freelancer-wallet")
    public ResponseEntity<Void> unlinkFreelancerWallet(
            @AuthenticationPrincipal UserSummaryDto user,
            @PathVariable UUID id) {
            
        projectService.unlinkFreelancerWallet(id, user.id());
        return ResponseEntity.noContent().build();
    }
}
