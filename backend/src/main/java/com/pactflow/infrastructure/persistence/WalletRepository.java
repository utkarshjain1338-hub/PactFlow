package com.pactflow.infrastructure.persistence;

import com.pactflow.domain.wallet.Wallet;
import com.pactflow.domain.wallet.WalletProvider;
import com.pactflow.infrastructure.persistence.entity.WalletJpaEntity;
import com.pactflow.infrastructure.persistence.jpa.WalletJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Concrete persistence adapter for Wallet aggregates.
 * Maps between pure domain Wallet objects and WalletJpaEntity records.
 */
@Component
@RequiredArgsConstructor
public class WalletRepository {

    private final WalletJpaRepository walletJpaRepository;

    /**
     * Finds all wallets by user ID.
     *
     * @param userId the user ID
     * @return list of wallets
     */
    public List<Wallet> findAllByUserId(final UUID userId) {
        return walletJpaRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtAsc(userId)
                .stream()
                .map(this::toDomain)
                .toList();
    }

    /**
     * Finds a wallet by ID and user ID.
     *
     * @param id the wallet ID
     * @param userId the user ID
     * @return the wallet
     */
    public Optional<Wallet> findByIdAndUserId(final UUID id, final UUID userId) {
        return walletJpaRepository.findByIdAndUserIdAndIsDeletedFalse(id, userId)
                .map(this::toDomain);
    }
    
    /**
     * Counts wallets by user ID.
     *
     * @param userId the user ID
     * @return the count
     */
    public long countByUserId(final UUID userId) {
        return walletJpaRepository.countByUserIdAndIsDeletedFalse(userId);
    }
    
    /**
     * Checks if a stellar public key exists.
     *
     * @param stellarPublicKey the stellar public key
     * @return true if exists
     */
    public boolean existsByStellarPublicKey(final String stellarPublicKey) {
        return walletJpaRepository.existsByStellarPublicKeyAndIsDeletedFalse(stellarPublicKey);
    }

    /**
     * Saves a wallet.
     *
     * @param wallet the wallet
     * @return the saved wallet
     */
    public Wallet save(final Wallet wallet) {
        final WalletJpaEntity entity = toEntity(wallet);
        final WalletJpaEntity saved = walletJpaRepository.save(entity);
        return toDomain(saved);
    }

    private Wallet toDomain(final WalletJpaEntity entity) {
        return new Wallet(
                entity.getId(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                0L, // version not stored for wallet_connections
                entity.getUserId(),
                entity.getStellarPublicKey(),
                WalletProvider.valueOf(entity.getWalletProvider()),
                entity.isPrimary(),
                entity.getVerifiedAt(),
                entity.isDeleted()
        );
    }

    private WalletJpaEntity toEntity(final Wallet domain) {
        return WalletJpaEntity.builder()
                .id(domain.getId())
                .userId(domain.getUserId())
                .stellarPublicKey(domain.getStellarPublicKey())
                .walletProvider(domain.getProvider().name())
                .isPrimary(domain.isPrimary())
                .verifiedAt(domain.getVerifiedAt())
                .isDeleted(domain.isDeleted())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }
}
