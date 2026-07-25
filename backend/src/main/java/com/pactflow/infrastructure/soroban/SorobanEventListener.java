package com.pactflow.infrastructure.soroban;

import com.pactflow.application.escrow.EscrowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Service responsible for polling Soroban RPC for contract events
 * and synchronizing the blockchain state with our internal database state.
 */
import org.springframework.context.annotation.Lazy;

@Service
@Lazy
@RequiredArgsConstructor
@Slf4j
public class SorobanEventListener {

    private final EscrowService escrowService;
    private final com.pactflow.domain.blockchain.BlockchainTransactionRepository transactionRepository;

    @Scheduled(fixedDelayString = "${stellar.sync.delay:5000}", initialDelayString = "${stellar.sync.initial-delay:15000}")
    public void pollForEvents() {
        // Mock polling: find PENDING transactions and confirm them after a few seconds
        var pendingTxs = transactionRepository.findByStatus(com.pactflow.domain.blockchain.BlockchainTransactionStatus.PENDING);
        
        for (var tx : pendingTxs) {
            // Confirm transactions that are older than 3 seconds
            if (tx.getCreatedAt().plusSeconds(3).isBefore(java.time.OffsetDateTime.now())) {
                log.info("Mocking Soroban confirmation for transaction hash: {}", tx.getTransactionHash());
                try {
                    escrowService.handleTransactionConfirmed(
                            tx.getTransactionHash(),
                            System.currentTimeMillis() / 1000,
                            java.time.OffsetDateTime.now()
                    );
                } catch (Exception e) {
                    log.error("Error confirming transaction {}", tx.getTransactionHash(), e);
                }
            }
        }
    }
}
