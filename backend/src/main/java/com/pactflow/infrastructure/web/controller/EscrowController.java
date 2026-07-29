package com.pactflow.infrastructure.web.controller;

import com.pactflow.application.escrow.EscrowService;
import com.pactflow.application.escrow.port.UnsignedTransaction;

import com.pactflow.domain.escrow.Escrow;
import com.pactflow.application.auth.dto.UserSummaryDto;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

import com.pactflow.domain.escrow.EscrowRepository;

@RestController
@RequestMapping("/api/v1/escrows")
public class EscrowController {

    private final EscrowService escrowService;
    private final EscrowRepository escrowRepository;

    public EscrowController(EscrowService escrowService, EscrowRepository escrowRepository) {
        this.escrowService = escrowService;
        this.escrowRepository = escrowRepository;
    }

    @PostMapping
    public ResponseEntity<Escrow> createEscrow(
            @AuthenticationPrincipal UserSummaryDto user,
            @RequestParam UUID projectId,
            @RequestParam UUID milestoneId) {
        Escrow escrow = escrowService.createEscrow(projectId, milestoneId);
        return ResponseEntity.ok(escrow);
    }

    @PostMapping("/{id}/initialization-transaction")
    public ResponseEntity<UnsignedTransaction> buildInitializationTransaction(
            @AuthenticationPrincipal UserSummaryDto user,
            @PathVariable UUID id) {
        UnsignedTransaction tx = escrowService.buildInitializationTransaction(id, user.id());
        return ResponseEntity.ok(tx);
    }

    @GetMapping
    public ResponseEntity<java.util.List<Escrow>> getEscrows(
            @AuthenticationPrincipal UserSummaryDto user,
            @RequestParam UUID projectId) {
        return ResponseEntity.ok(escrowRepository.findByProjectId(projectId));
    }

    @PostMapping("/{id}/funding-transaction")
    public ResponseEntity<UnsignedTransaction> buildFundingTransaction(
            @AuthenticationPrincipal UserSummaryDto user,
            @PathVariable UUID id) {
        UnsignedTransaction tx = escrowService.buildFundingTransaction(id, user.id());
        return ResponseEntity.ok(tx);
    }

    @PostMapping("/{id}/release")
    public ResponseEntity<UnsignedTransaction> buildReleaseTransaction(
            @AuthenticationPrincipal UserSummaryDto user,
            @PathVariable UUID id) {
        UnsignedTransaction tx = escrowService.buildReleaseTransaction(id, user.id());
        return ResponseEntity.ok(tx);
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<UnsignedTransaction> buildRefundTransaction(
            @AuthenticationPrincipal UserSummaryDto user,
            @PathVariable UUID id) {
        UnsignedTransaction tx = escrowService.buildRefundTransaction(id, user.id());
        return ResponseEntity.ok(tx);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Escrow> getEscrow(
            @AuthenticationPrincipal UserSummaryDto user,
            @PathVariable UUID id) {
        return escrowRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
