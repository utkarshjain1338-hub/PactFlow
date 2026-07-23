package com.pactflow.infrastructure.web.controller;

import com.pactflow.application.escrow.EscrowService;
import com.pactflow.domain.blockchain.BlockchainOperation;
import com.pactflow.domain.user.User;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import com.pactflow.domain.blockchain.BlockchainTransaction;
import com.pactflow.domain.blockchain.BlockchainTransactionRepository;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    private final EscrowService escrowService;
    private final BlockchainTransactionRepository blockchainTransactionRepository;

    public TransactionController(EscrowService escrowService, BlockchainTransactionRepository blockchainTransactionRepository) {
        this.escrowService = escrowService;
        this.blockchainTransactionRepository = blockchainTransactionRepository;
    }

    @Data
    public static class SubmitTransactionRequest {
        private UUID escrowId;
        private String signedXdr;
        private String transactionHash;
        private BlockchainOperation operation;
    }

    @PostMapping
    public ResponseEntity<Void> submitTransaction(
            @AuthenticationPrincipal User user,
            @RequestBody SubmitTransactionRequest request) {
        
        escrowService.submitSignedTransaction(request.getEscrowId(), request.getTransactionHash(), request.getOperation());
        return ResponseEntity.accepted().build(); // 202 Accepted
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlockchainTransaction> getTransaction(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        return blockchainTransactionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
