package com.pactflow.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "wallet_connections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletJpaEntity {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "stellar_public_key", nullable = false, unique = true, length = 56)
    private String stellarPublicKey;

    @Column(name = "wallet_provider", nullable = false, length = 50)
    private String walletProvider;

    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
