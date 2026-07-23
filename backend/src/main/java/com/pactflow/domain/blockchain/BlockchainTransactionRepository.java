package com.pactflow.domain.blockchain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BlockchainTransactionRepository {
    BlockchainTransaction save(BlockchainTransaction transaction);
    Optional<BlockchainTransaction> findById(UUID id);
    Optional<BlockchainTransaction> findByTransactionHash(String transactionHash);
    List<BlockchainTransaction> findByEscrowId(UUID escrowId);
    List<BlockchainTransaction> findByStatus(BlockchainTransactionStatus status);
}
