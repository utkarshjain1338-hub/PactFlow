package com.pactflow.domain.wallet;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WalletRepository {
    List<Wallet> findAllByUserId(UUID userId);
    Optional<Wallet> findByIdAndUserId(UUID id, UUID userId);
    long countByUserId(UUID userId);
    boolean existsByStellarPublicKey(String publicKey);
    Wallet save(Wallet wallet);
}
