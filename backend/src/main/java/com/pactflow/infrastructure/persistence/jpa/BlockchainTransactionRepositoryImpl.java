package com.pactflow.infrastructure.persistence.jpa;

import com.pactflow.domain.blockchain.BlockchainTransaction;
import com.pactflow.domain.blockchain.BlockchainTransactionRepository;
import com.pactflow.infrastructure.persistence.JpaBlockchainTransactionRepository;
import com.pactflow.infrastructure.persistence.entity.BlockchainTransactionJpaEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class BlockchainTransactionRepositoryImpl implements BlockchainTransactionRepository {

    private final JpaBlockchainTransactionRepository jpaRepository;

    @Override
    public BlockchainTransaction save(BlockchainTransaction transaction) {
        BlockchainTransactionJpaEntity entity = toEntity(transaction);
        BlockchainTransactionJpaEntity savedEntity = jpaRepository.save(entity);
        return toDomain(savedEntity);
    }

    @Override
    public Optional<BlockchainTransaction> findById(UUID id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<BlockchainTransaction> findByTransactionHash(String transactionHash) {
        return jpaRepository.findByTransactionHash(transactionHash).map(this::toDomain);
    }

    @Override
    public List<BlockchainTransaction> findByEscrowId(UUID escrowId) {
        return jpaRepository.findByEscrowId(escrowId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<BlockchainTransaction> findByStatus(com.pactflow.domain.blockchain.BlockchainTransactionStatus status) {
        return jpaRepository.findByStatus(status).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    private BlockchainTransactionJpaEntity toEntity(BlockchainTransaction domain) {
        BlockchainTransactionJpaEntity entity = new BlockchainTransactionJpaEntity();
        entity.setId(domain.getId());
        entity.setEscrowId(domain.getEscrowId());
        entity.setTransactionHash(domain.getTransactionHash());
        entity.setOperation(domain.getOperation());
        entity.setStatus(domain.getStatus());
        entity.setLedger(domain.getLedger());
        entity.setFailureReason(domain.getFailureReason());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setConfirmedAt(domain.getConfirmedAt());
        entity.setVersion(domain.getVersion());
        return entity;
    }

    private BlockchainTransaction toDomain(BlockchainTransactionJpaEntity entity) {
        return BlockchainTransaction.builder()
                .id(entity.getId())
                .escrowId(entity.getEscrowId())
                .transactionHash(entity.getTransactionHash())
                .operation(entity.getOperation())
                .status(entity.getStatus())
                .ledger(entity.getLedger())
                .failureReason(entity.getFailureReason())
                .createdAt(entity.getCreatedAt())
                .confirmedAt(entity.getConfirmedAt())
                .version(entity.getVersion())
                .build();
    }
}
