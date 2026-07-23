package com.pactflow.infrastructure.persistence.entity;

import com.pactflow.domain.blockchain.BlockchainOperation;
import com.pactflow.domain.blockchain.BlockchainTransactionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "blockchain_transactions")
@Getter
@Setter
public class BlockchainTransactionJpaEntity {

    @Id
    private UUID id;

    @Column(name = "escrow_id", nullable = false)
    private UUID escrowId;

    @Column(name = "transaction_hash", nullable = false, unique = true, length = 64)
    private String transactionHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation", nullable = false, length = 20)
    private BlockchainOperation operation;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private BlockchainTransactionStatus status;

    @Column(name = "ledger")
    private Long ledger;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "confirmed_at")
    private OffsetDateTime confirmedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;
}
