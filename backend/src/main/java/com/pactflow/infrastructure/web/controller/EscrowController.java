package com.pactflow.infrastructure.web.controller;

import com.pactflow.application.escrow.EscrowService;
import com.pactflow.application.escrow.port.UnsignedTransaction;
import com.pactflow.domain.blockchain.BlockchainOperation;
import com.pactflow.domain.escrow.Escrow;
import com.pactflow.domain.user.User;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import com.pactflow.domain.escrow.EscrowRepository;

@RestController
@RequestMapping("/escrows")
public class EscrowController {

    private final EscrowService escrowService;
    private final EscrowRepository escrowRepository;

    public EscrowController(EscrowService escrowService, EscrowRepository escrowRepository) {
        this.escrowService = escrowService;
        this.escrowRepository = escrowRepository;
    }

    @PostMapping
    public ResponseEntity<Escrow> createEscrow(
            @AuthenticationPrincipal User user,
            @RequestParam UUID projectId,
            @RequestParam UUID milestoneId) {
        Escrow escrow = escrowService.createEscrow(projectId, milestoneId);
        return ResponseEntity.ok(escrow);
    }

    @GetMapping
    public ResponseEntity<java.util.List<Escrow>> getEscrows(
            @AuthenticationPrincipal User user,
            @RequestParam UUID projectId) {
        return ResponseEntity.ok(escrowRepository.findByProjectId(projectId));
    }

    @PostMapping("/{id}/funding-transaction")
    public ResponseEntity<UnsignedTransaction> buildFundingTransaction(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        UnsignedTransaction tx = escrowService.buildFundingTransaction(id);
        return ResponseEntity.ok(tx);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Escrow> getEscrow(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        return escrowRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
