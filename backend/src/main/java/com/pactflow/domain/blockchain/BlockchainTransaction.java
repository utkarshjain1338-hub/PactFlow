package com.pactflow.domain.blockchain;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder(toBuilder = true)
public class BlockchainTransaction {
    private final UUID id;
    private final UUID escrowId;
    private final String transactionHash;
    private final BlockchainOperation operation;
    private final BlockchainTransactionStatus status;
    private final Long ledger;
    private final String failureReason;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime confirmedAt;
    private final Long version;

    /**
     * Creates a new blockchain transaction.
     *
     * @param escrowId the escrow ID
     * @param transactionHash the transaction hash
     * @param operation the blockchain operation
     * @return the created transaction
     */
    public static BlockchainTransaction create(UUID escrowId, String transactionHash, BlockchainOperation operation) {
        if (escrowId == null) {
            throw new IllegalArgumentException("escrowId cannot be null");
        }
        if (transactionHash == null || transactionHash.isBlank()) {
            throw new IllegalArgumentException("transactionHash cannot be null or blank");
        }
        if (operation == null) {
            throw new IllegalArgumentException("operation cannot be null");
        }

        return BlockchainTransaction.builder()
                .id(UUID.randomUUID())
                .escrowId(escrowId)
                .transactionHash(transactionHash)
                .operation(operation)
                .status(BlockchainTransactionStatus.PENDING)
                .createdAt(OffsetDateTime.now())
                .build();
    }

    /**
     * Marks the transaction as successful.
     *
     * @param ledger the ledger number
     * @param confirmedAt the confirmation time
     * @return the updated transaction
     */
    public BlockchainTransaction markSuccess(Long ledger, OffsetDateTime confirmedAt) {
        if (this.status != BlockchainTransactionStatus.PENDING) {
            throw new IllegalStateException("Transaction is not pending");
        }
        return this.toBuilder()
                .status(BlockchainTransactionStatus.SUCCESS)
                .ledger(ledger)
                .confirmedAt(confirmedAt)
                .build();
    }

    /**
     * Marks the transaction as failed.
     *
     * @param failureReason the failure reason
     * @return the updated transaction
     */
    public BlockchainTransaction markFailed(String failureReason) {
        if (this.status != BlockchainTransactionStatus.PENDING) {
            throw new IllegalStateException("Transaction is not pending");
        }
        return this.toBuilder()
                .status(BlockchainTransactionStatus.FAILED)
                .failureReason(failureReason)
                .build();
    }
}
