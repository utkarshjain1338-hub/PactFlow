package com.pactflow.infrastructure.persistence.jpa;

import com.pactflow.infrastructure.persistence.entity.WalletJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WalletJpaRepository extends JpaRepository<WalletJpaEntity, UUID> {

    List<WalletJpaEntity> findByUserIdAndIsDeletedFalseOrderByCreatedAtAsc(UUID userId);

    Optional<WalletJpaEntity> findByIdAndUserIdAndIsDeletedFalse(UUID id, UUID userId);
    
    long countByUserIdAndIsDeletedFalse(UUID userId);

    boolean existsByStellarPublicKeyAndIsDeletedFalse(String stellarPublicKey);
}
