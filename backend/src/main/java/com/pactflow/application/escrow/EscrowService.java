package com.pactflow.application.escrow;

import com.pactflow.application.escrow.port.EscrowContractGateway;
import com.pactflow.application.escrow.port.UnsignedTransaction;
import com.pactflow.domain.blockchain.BlockchainOperation;
import com.pactflow.domain.blockchain.BlockchainTransaction;
import com.pactflow.domain.blockchain.BlockchainTransactionRepository;
import com.pactflow.domain.escrow.Escrow;
import com.pactflow.domain.escrow.EscrowRepository;
import com.pactflow.domain.project.Project;
import com.pactflow.domain.project.ProjectRepository;
import com.pactflow.application.wallet.WalletService;
import com.pactflow.infrastructure.soroban.SorobanEscrowGateway;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EscrowService {

    private final EscrowRepository escrowRepository;
    private final ProjectRepository projectRepository;
    private final EscrowContractGateway escrowContractGateway;
    private final BlockchainTransactionRepository blockchainTransactionRepository;
    private final WalletService walletService;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;
    private final SorobanEscrowGateway sorobanEscrowGateway;
    private final com.pactflow.domain.wallet.WalletRepository walletRepository;
    private final com.pactflow.domain.milestone.MilestoneRepository milestoneRepository;

    public EscrowService(EscrowRepository escrowRepository, ProjectRepository projectRepository,
                         EscrowContractGateway escrowContractGateway,
                         BlockchainTransactionRepository blockchainTransactionRepository,
                         WalletService walletService,
                         org.springframework.context.ApplicationEventPublisher eventPublisher,
                         SorobanEscrowGateway sorobanEscrowGateway,
                         com.pactflow.domain.wallet.WalletRepository walletRepository,
                         com.pactflow.domain.milestone.MilestoneRepository milestoneRepository) {
        this.escrowRepository = escrowRepository;
        this.projectRepository = projectRepository;
        this.escrowContractGateway = escrowContractGateway;
        this.blockchainTransactionRepository = blockchainTransactionRepository;
        this.walletService = walletService;
        this.eventPublisher = eventPublisher;
        this.sorobanEscrowGateway = sorobanEscrowGateway;
        this.walletRepository = walletRepository;
        this.milestoneRepository = milestoneRepository;
    }

    /**
     * Creates an escrow.
     *
     * @param projectId   the project ID
     * @param milestoneId the milestone ID
     * @return the escrow
     */
    @Transactional
    public Escrow createEscrow(UUID projectId, UUID milestoneId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        if (!project.isStructurallyReady()) {
            throw new IllegalStateException("Project is not structurally ready for escrow.");
        }

        if (escrowRepository.findByMilestoneId(milestoneId).isPresent()) {
            throw new IllegalStateException("Escrow already exists for this milestone.");
        }

        Escrow escrow = Escrow.create(projectId, milestoneId);
        return escrowRepository.save(escrow);
    }

    /**
     * Builds an initialization transaction.
     *
     * @param escrowId the escrow ID
     * @param userId   the user ID
     * @return the unsigned transaction
     */
    @Transactional
    public UnsignedTransaction buildInitializationTransaction(UUID escrowId, UUID userId) {
        walletService.assertVerifiedPrimaryWallet(userId);
        String sourceAccountAddress = walletService.getVerifiedPrimaryWalletPublicKey(userId);

        Escrow escrow = getEscrow(escrowId);
        Project project = projectRepository.findById(escrow.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found for escrow: " + escrowId));

        // Fetch the actual Stellar public keys from the wallet IDs stored on the project
        String clientPublicKey = walletRepository.findById(project.getClientWalletId())
                .orElseThrow(() -> new IllegalStateException("Client wallet not found"))
                .getStellarPublicKey();

        String freelancerPublicKey = walletRepository.findById(project.getFreelancerWalletId())
                .orElseThrow(() -> new IllegalStateException("Freelancer wallet not found"))
                .getStellarPublicKey();

        // Get the milestone amount for this specific escrow
        com.pactflow.domain.milestone.Milestone milestone = milestoneRepository.findById(escrow.getMilestoneId())
                .orElseThrow(() -> new IllegalArgumentException("Milestone not found for escrow"));

        return sorobanEscrowGateway.buildInitializationTransaction(
                escrow.getId(),
                clientPublicKey,
                freelancerPublicKey,
                milestone.getAmountXlm(),
                sourceAccountAddress
        );
    }

    /**
     * Builds a funding transaction.
     *
     * @param escrowId the escrow ID
     * @param userId   the user ID
     * @return the unsigned transaction
     */
    @Transactional
    public UnsignedTransaction buildFundingTransaction(UUID escrowId, UUID userId) {
        walletService.assertVerifiedPrimaryWallet(userId);
        String sourceAccountAddress = walletService.getVerifiedPrimaryWalletPublicKey(userId);
        Escrow escrow = getEscrow(escrowId);
        
        // Ensure state is valid before building transaction
        if (escrow.getStatus() != com.pactflow.domain.escrow.EscrowStatus.PENDING_FUNDING) {
            throw new IllegalStateException("Escrow is not in a valid state for funding. Must be initialized first.");
        }
        
        return escrowContractGateway.buildFundingTransaction(escrow, sourceAccountAddress);
    }

    /**
     * Submits a signed transaction.
     *
     * @param escrowId        the escrow ID
     * @param transactionHash the transaction hash
     * @param operation       the blockchain operation
     */
    @Transactional
    public void submitSignedTransaction(UUID escrowId, String transactionHash, BlockchainOperation operation) {
        // Called by the frontend after signing and broadcasting to the Stellar network.
        // The real transaction hash comes from the Stellar network after broadcast.
        BlockchainTransaction tx = BlockchainTransaction.create(escrowId, transactionHash, operation);
        blockchainTransactionRepository.save(tx);
    }

    // These are called by the SorobanEventListener once the blockchain confirms the transaction
    /**
     * Handles transaction confirmed.
     *
     * @param transactionHash the transaction hash
     * @param ledger          the ledger
     * @param confirmedAt     the confirmed time
     * @return the escrow
     */
    @Transactional
    public Escrow handleTransactionConfirmed(String transactionHash, Long ledger, OffsetDateTime confirmedAt) {
        BlockchainTransaction tx = blockchainTransactionRepository.findByTransactionHash(transactionHash)
                .orElseThrow(() -> new IllegalArgumentException("Unknown transaction hash: " + transactionHash));
        
        tx = tx.markSuccess(ledger, confirmedAt);
        blockchainTransactionRepository.save(tx);

        Escrow escrow = getEscrow(tx.getEscrowId());

        String eventType = "transaction.confirmed";

        switch (tx.getOperation()) {
            case INITIALIZE -> {
                if (escrow.getStatus() != com.pactflow.domain.escrow.EscrowStatus.CREATED) {
                    log.info("Escrow {} is already past CREATED status, skipping INITIALIZE event as duplicate", escrow.getId());
                    return escrow;
                }
                // Contract is now initialized on-chain
                escrow.initiateFunding();
                eventType = "escrow.initialized";
            }
            case FUND -> { 
                if (escrow.getStatus() != com.pactflow.domain.escrow.EscrowStatus.PENDING_FUNDING) {
                    log.info("Escrow {} is already past PENDING_FUNDING status, skipping FUND event as duplicate", escrow.getId());
                    return escrow;
                }
                com.pactflow.domain.milestone.Milestone m = milestoneRepository
                        .findById(escrow.getMilestoneId()).orElse(null);
                if (m != null) {
                    escrow.markFunded(m.getAmountXlm(), transactionHash);
                    if (m.getStatus() == com.pactflow.domain.milestone.MilestoneStatus.DRAFT) {
                        m.markAsFunded();
                        m.markAsInProgress();
                    } else if (m.getStatus() == com.pactflow.domain.milestone.MilestoneStatus.FUNDED) {
                        m.markAsInProgress();
                    }
                    milestoneRepository.save(m);
                } else {
                    // Fallback just in case milestone is missing, though it shouldn't be
                    escrow.markFunded(BigDecimal.ONE, transactionHash);
                }
                eventType = "escrow.funded"; 
            }
            case RELEASE -> { 
                if (escrow.getStatus() != com.pactflow.domain.escrow.EscrowStatus.APPROVED && 
                    escrow.getStatus() != com.pactflow.domain.escrow.EscrowStatus.DISPUTED) {
                    log.info("Escrow {} is not in APPROVED or DISPUTED status, skipping RELEASE event as duplicate", escrow.getId());
                    return escrow;
                }
                escrow.release(transactionHash); 
                eventType = "escrow.released"; 
            }
            case REFUND -> { 
                if (escrow.getStatus() != com.pactflow.domain.escrow.EscrowStatus.FUNDED && 
                    escrow.getStatus() != com.pactflow.domain.escrow.EscrowStatus.DISPUTED) {
                    log.info("Escrow {} is not in FUNDED or DISPUTED status, skipping REFUND event as duplicate", escrow.getId());
                    return escrow;
                }
                escrow.refund(transactionHash); 
                eventType = "escrow.refunded"; 
            }
            default -> throw new IllegalStateException("Unsupported operation: " + tx.getOperation());
        }

        escrow = escrowRepository.save(escrow);

        eventPublisher.publishEvent(com.pactflow.application.event.dto.SseEventPayload.builder()
                .eventId(UUID.randomUUID().toString())
                .timestamp(java.time.Instant.now())
                .entityId(escrow.getId().toString())
                .type(eventType)
                .payload(escrow)
                .build());

        return escrow;
    }

    /**
     * Builds a release transaction.
     *
     * @param escrowId the escrow ID
     * @param userId   the user ID
     * @return the unsigned transaction
     */
    @Transactional
    public UnsignedTransaction buildReleaseTransaction(UUID escrowId, UUID userId) {
        walletService.assertVerifiedPrimaryWallet(userId);
        String sourceAccountAddress = walletService.getVerifiedPrimaryWalletPublicKey(userId);
        Escrow escrow = getEscrow(escrowId);
        if (escrow.getStatus() != com.pactflow.domain.escrow.EscrowStatus.APPROVED && 
            escrow.getStatus() != com.pactflow.domain.escrow.EscrowStatus.DISPUTED) {
            throw new IllegalStateException("Escrow is not in a valid state for release.");
        }
        return escrowContractGateway.buildReleaseTransaction(escrow, sourceAccountAddress);
    }

    /**
     * Builds a refund transaction.
     *
     * @param escrowId the escrow ID
     * @param userId   the user ID
     * @return the unsigned transaction
     */
    @Transactional
    public UnsignedTransaction buildRefundTransaction(UUID escrowId, UUID userId) {
        walletService.assertVerifiedPrimaryWallet(userId);
        String sourceAccountAddress = walletService.getVerifiedPrimaryWalletPublicKey(userId);
        Escrow escrow = getEscrow(escrowId);
        if (escrow.getStatus() != com.pactflow.domain.escrow.EscrowStatus.FUNDED && 
            escrow.getStatus() != com.pactflow.domain.escrow.EscrowStatus.DISPUTED) {
            throw new IllegalStateException("Escrow is not in a valid state for refund.");
        }
        return escrowContractGateway.buildRefundTransaction(escrow, sourceAccountAddress);
    }

    /**
     * Handles transaction failed.
     *
     * @param transactionHash the transaction hash
     * @param failureReason   the failure reason
     */
    @Transactional
    public void handleTransactionFailed(String transactionHash, String failureReason) {
        BlockchainTransaction tx = blockchainTransactionRepository.findByTransactionHash(transactionHash)
                .orElseThrow(() -> new IllegalArgumentException("Unknown transaction hash: " + transactionHash));
        
        tx = tx.markFailed(failureReason);
        blockchainTransactionRepository.save(tx);
        
        // Do not revert business state (e.g. Escrow remains APPROVED or FUNDED) to allow the user to retry.
    }

    // ... other methods omitted for brevity, but they would follow a similar buildXyz -> submit -> confirm pattern

    @Transactional
    public Escrow submitWork(UUID escrowId) {
        Escrow escrow = getEscrow(escrowId);
        escrow.submitWork();
        return escrowRepository.save(escrow);
    }

    @Transactional
    public Escrow startReview(UUID escrowId) {
        Escrow escrow = getEscrow(escrowId);
        escrow.startReview();
        return escrowRepository.save(escrow);
    }

    @Transactional
    public Escrow approve(UUID escrowId) {
        Escrow escrow = getEscrow(escrowId);
        escrow.approve();
        return escrowRepository.save(escrow);
    }

    @Transactional
    public Escrow dispute(UUID escrowId) {
        Escrow escrow = getEscrow(escrowId);
        escrow.dispute();
        return escrowRepository.save(escrow);
    }

    @Transactional
    public Escrow markFailed(UUID escrowId) {
        Escrow escrow = getEscrow(escrowId);
        escrow.markFailed();
        return escrowRepository.save(escrow);
    }

    private Escrow getEscrow(UUID escrowId) {
        return escrowRepository.findById(escrowId)
                .orElseThrow(() -> new IllegalArgumentException("Escrow not found: " + escrowId));
    }
}
