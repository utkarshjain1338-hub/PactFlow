package com.pactflow.infrastructure.web.controller;

import com.pactflow.application.project.ProjectService;
import com.pactflow.application.project.dto.CreateProjectRequest;
import com.pactflow.application.project.dto.LinkWalletRequest;
import com.pactflow.application.project.dto.ProjectDto;
import com.pactflow.application.project.dto.UpdateProjectRequest;
import com.pactflow.domain.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public ResponseEntity<ProjectDto> createProject(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateProjectRequest request) {
        
        ProjectDto project = projectService.createProject(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(project);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProject(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        
        ProjectDto project = projectService.getProject(id, user.getId());
        return ResponseEntity.ok(project);
    }

    @GetMapping
    public ResponseEntity<List<ProjectDto>> getMyProjects(@AuthenticationPrincipal User user) {
        List<ProjectDto> asClient = projectService.getProjectsForClient(user.getId());
        List<ProjectDto> asAssignee = projectService.getProjectsForAssignee(user.getId());
        
        // Merge lists
        asClient.addAll(asAssignee);
        return ResponseEntity.ok(asClient);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProjectDto> updateProject(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProjectRequest request) {
            
        ProjectDto project = projectService.updateProject(id, user.getId(), request);
        return ResponseEntity.ok(project);
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<ProjectDto> archiveProject(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
            
        ProjectDto project = projectService.archiveProject(id, user.getId());
        return ResponseEntity.ok(project);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
            
        projectService.deleteProject(id, user.getId());
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/client-wallet")
    public ResponseEntity<ProjectDto> linkClientWallet(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @Valid @RequestBody LinkWalletRequest request) {
            
        ProjectDto project = projectService.linkClientWallet(id, user.getId(), request.getWalletId());
        return ResponseEntity.ok(project);
    }
    
    @DeleteMapping("/{id}/client-wallet")
    public ResponseEntity<Void> unlinkClientWallet(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
            
        projectService.unlinkClientWallet(id, user.getId());
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/freelancer-wallet")
    public ResponseEntity<ProjectDto> linkFreelancerWallet(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @Valid @RequestBody LinkWalletRequest request) {
            
        ProjectDto project = projectService.linkFreelancerWallet(id, user.getId(), request.getWalletId());
        return ResponseEntity.ok(project);
    }
    
    @DeleteMapping("/{id}/freelancer-wallet")
    public ResponseEntity<Void> unlinkFreelancerWallet(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
            
        projectService.unlinkFreelancerWallet(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
