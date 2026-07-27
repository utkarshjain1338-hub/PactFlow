package com.pactflow.infrastructure.web.controller;

import com.pactflow.application.escrow.EscrowService;
import com.pactflow.domain.blockchain.BlockchainOperation;
import com.pactflow.application.auth.dto.UserSummaryDto;
import com.pactflow.infrastructure.soroban.SorobanEscrowGateway;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import com.pactflow.domain.blockchain.BlockchainTransaction;
import com.pactflow.domain.blockchain.BlockchainTransactionRepository;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final EscrowService escrowService;
    private final BlockchainTransactionRepository blockchainTransactionRepository;
    private final SorobanEscrowGateway sorobanEscrowGateway;

    public TransactionController(EscrowService escrowService,
                                 BlockchainTransactionRepository blockchainTransactionRepository,
                                 SorobanEscrowGateway sorobanEscrowGateway) {
        this.escrowService = escrowService;
        this.blockchainTransactionRepository = blockchainTransactionRepository;
        this.sorobanEscrowGateway = sorobanEscrowGateway;
    }

    @Data
    public static class SubmitTransactionRequest {
        private UUID escrowId;
        private String signedXdr;
        private BlockchainOperation operation;
    }

    /**
     * Receives the signed XDR from the frontend after Freighter signs it,
     * broadcasts it to the Stellar network, and records the real transaction hash.
     */
    @PostMapping
    public ResponseEntity<Void> submitTransaction(
            @AuthenticationPrincipal UserSummaryDto user,
            @RequestBody SubmitTransactionRequest request) {

        // Broadcast to Stellar network and get the real transaction hash
        String transactionHash = sorobanEscrowGateway.broadcastTransaction(request.getSignedXdr());

        escrowService.submitSignedTransaction(request.getEscrowId(), transactionHash, request.getOperation());
        return ResponseEntity.accepted().build(); // 202 Accepted
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlockchainTransaction> getTransaction(
            @AuthenticationPrincipal UserSummaryDto user,
            @PathVariable UUID id) {
        return blockchainTransactionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
