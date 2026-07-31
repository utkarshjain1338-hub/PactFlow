package com.pactflow.infrastructure.soroban;

import com.pactflow.infrastructure.config.PactFlowProperties;
import com.pactflow.application.escrow.EscrowService;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.stellar.sdk.SorobanServer;
import org.stellar.sdk.responses.sorobanrpc.GetTransactionResponse;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Service responsible for polling Soroban RPC for contract events
 * and synchronizing the blockchain state with our internal database state.
 */

@Service
@Slf4j
public class SorobanEventListener {

    private final EscrowService escrowService;
    private final com.pactflow.domain.blockchain.BlockchainTransactionRepository transactionRepository;
    private final SorobanServer sorobanServer;

    /**
     * Creates a listener backed by the configured Soroban RPC endpoint.
     */
    public SorobanEventListener(
            EscrowService escrowService,
            com.pactflow.domain.blockchain.BlockchainTransactionRepository transactionRepository,
            PactFlowProperties pactFlowProperties) {
        this.escrowService = escrowService;
        this.transactionRepository = transactionRepository;
        this.sorobanServer = new SorobanServer(
                pactFlowProperties.getStellar().getSorobanRpcUrl());
    }

        /**
         * Polls Soroban RPC for pending transactions and applies confirmed status updates.
         */
        @Scheduled(
            fixedDelayString = "${pactflow.ingestion.poll-interval-seconds:3}000",
            initialDelayString = "15000")
    public void pollForEvents() {
        var pendingTxs = transactionRepository.findByStatus(
            com.pactflow.domain.blockchain.BlockchainTransactionStatus.PENDING);
        
        for (var tx : pendingTxs) {
            try {
                if (java.time.OffsetDateTime.now().minusMinutes(10).isAfter(tx.getCreatedAt())) {
                    log.warn("Transaction {} has been pending for >= 10 minutes. " +
                             "Marking as FAILED.", tx.getTransactionHash());
                    escrowService.handleTransactionFailed(tx.getTransactionHash(), 
                            "Transaction timed out after 10 minutes");
                    continue;
                }

                GetTransactionResponse response = sorobanServer.getTransaction(tx.getTransactionHash());
                if (response == null || response.getStatus() == null) {
                    continue;
                }

                log.info("hash={} status={}", tx.getTransactionHash(), response.getStatus());

                switch (response.getStatus()) {
                    case SUCCESS -> escrowService.handleTransactionConfirmed(
                            tx.getTransactionHash(),
                            response.getLedger(),
                            java.time.OffsetDateTime.now());
                    case FAILED -> escrowService.handleTransactionFailed(
                            tx.getTransactionHash(),
                            "Soroban RPC reported FAILED");
                    case NOT_FOUND -> log.debug(
                        "Soroban transaction not found yet: {}",
                        tx.getTransactionHash());
                    default -> log.debug(
                        "Soroban transaction {} returned unexpected status {}",
                        tx.getTransactionHash(),
                        response.getStatus());
                }
            } catch (Exception e) {
                log.error("Error polling Soroban transaction {}", tx.getTransactionHash(), e);
            }
        }
    }

    @PreDestroy
    public void close() throws Exception {
        sorobanServer.close();
    }
}
