package com.pactflow.infrastructure.persistence;

import com.pactflow.infrastructure.persistence.entity.BlockchainTransactionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaBlockchainTransactionRepository extends JpaRepository<BlockchainTransactionJpaEntity, UUID> {
    Optional<BlockchainTransactionJpaEntity> findByTransactionHash(String transactionHash);
    List<BlockchainTransactionJpaEntity> findByEscrowId(UUID escrowId);
    List<BlockchainTransactionJpaEntity> findByStatus(com.pactflow.domain.blockchain.BlockchainTransactionStatus status);
}
