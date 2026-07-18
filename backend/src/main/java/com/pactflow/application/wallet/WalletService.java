package com.pactflow.application.wallet;

import com.pactflow.application.wallet.dto.AddWalletRequest;
import com.pactflow.application.wallet.dto.ChallengeResponse;
import com.pactflow.application.wallet.dto.VerifyWalletRequest;
import com.pactflow.application.wallet.dto.WalletResponse;
import com.pactflow.application.wallet.exception.WalletLockedException;
import com.pactflow.domain.wallet.Wallet;
import com.pactflow.infrastructure.persistence.WalletRepository;
import com.pactflow.infrastructure.web.exception.BusinessRuleViolationException;
import com.pactflow.infrastructure.web.exception.DuplicateResourceException;
import com.pactflow.infrastructure.web.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Application service orchestrating Wallet management.
 */
@Service
@RequiredArgsConstructor
public class WalletService {

    public static final String WALLET_LOCK_PREFIX = "wallet:lock:";

    private final WalletRepository walletRepository;
    private final StringRedisTemplate redisTemplate;

    /**
     * Gets all wallets for a user.
     *
     * @param userId the user ID
     * @return list of wallet responses
     */
    @Transactional(readOnly = true)
    public List<WalletResponse> getWallets(final UUID userId) {
        return walletRepository.findAllByUserId(userId)
                .stream()
                .map(WalletResponse::from)
                .toList();
    }

    /**
     * Adds a new wallet for a user.
     *
     * @param userId the user ID
     * @param request the add wallet request
     * @return the added wallet response
     */
    @Transactional
    public WalletResponse addWallet(final UUID userId, final AddWalletRequest request) {
        enforceWalletLock(userId);

        if (walletRepository.countByUserId(userId) >= 3) {
            throw new BusinessRuleViolationException("Maximum limit of 3 wallets reached.");
        }

        if (walletRepository.existsByStellarPublicKey(request.stellarPublicKey())) {
            throw new DuplicateResourceException("This wallet is already registered to an account.");
        }

        final Wallet wallet = new Wallet(
                UUID.randomUUID(),
                userId,
                request.stellarPublicKey(),
                request.provider()
        );

        // First wallet is always primary
        if (walletRepository.countByUserId(userId) == 0) {
            wallet.setPrimary(true);
        }

        return WalletResponse.from(walletRepository.save(wallet));
    }

    /**
     * Deletes a wallet for a user.
     *
     * @param userId the user ID
     * @param walletId the wallet ID
     */
    @Transactional
    public void deleteWallet(final UUID userId, final UUID walletId) {
        enforceWalletLock(userId);

        final Wallet wallet = walletRepository.findByIdAndUserId(walletId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Wallet not found"));

        wallet.softDelete();
        walletRepository.save(wallet);

        // If the primary wallet was deleted, promote the oldest remaining wallet
        if (wallet.isPrimary()) {
            promoteOldestWallet(userId);
        }
    }

    /**
     * Sets a wallet as the primary wallet for a user.
     *
     * @param userId the user ID
     * @param walletId the wallet ID
     */
    @Transactional
    public void setPrimaryWallet(final UUID userId, final UUID walletId) {
        enforceWalletLock(userId);

        final Wallet targetWallet = walletRepository.findByIdAndUserId(walletId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Wallet not found"));

        if (!targetWallet.isVerified()) {
            throw new BusinessRuleViolationException("Only verified wallets can be set as primary.");
        }

        final List<Wallet> existingWallets = walletRepository.findAllByUserId(userId);
        for (final Wallet w : existingWallets) {
            if (w.isPrimary()) {
                w.setPrimary(false);
                walletRepository.save(w);
            }
        }

        targetWallet.setPrimary(true);
        walletRepository.save(targetWallet);
    }

    /**
     * Enforces the wallet lock for a user.
     *
     * @param userId the user ID
     */
    public void enforceWalletLock(final UUID userId) {
        if (Boolean.TRUE.equals(redisTemplate.hasKey(WALLET_LOCK_PREFIX + userId))) {
            throw new WalletLockedException("Wallet operations are locked for 24 hours after a password change");
        }
    }

    /**
     * Generates a verification challenge for a wallet.
     *
     * @param userId the user ID
     * @param walletId the wallet ID
     * @return the challenge response
     */
    @Transactional
    public ChallengeResponse generateChallenge(final UUID userId, final UUID walletId) {
        enforceWalletLock(userId);
        
        final Wallet wallet = walletRepository.findByIdAndUserId(walletId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Wallet not found"));
                
        if (wallet.isVerified()) {
            throw new BusinessRuleViolationException("Wallet is already verified.");
        }

        final byte[] bytes = new byte[32];
        new java.security.SecureRandom().nextBytes(bytes);
        final String nonce = java.util.HexFormat.of().formatHex(bytes);

        final String key = "wallet:challenge:" + userId + ":" + wallet.getStellarPublicKey();
        redisTemplate.opsForValue().set(key, nonce, java.time.Duration.ofMinutes(10));

        return ChallengeResponse.builder()
                .nonce(nonce)
                .expiresAtEpochSeconds(java.time.Instant.now().plus(java.time.Duration.ofMinutes(10)).getEpochSecond())
                .build();
    }

    /**
     * Verifies a wallet.
     *
     * @param userId the user ID
     * @param request the verify wallet request
     */
    @Transactional
    public void verifyWallet(final UUID userId, final VerifyWalletRequest request) {
        enforceWalletLock(userId);

        final Wallet wallet = walletRepository.findByIdAndUserId(request.walletId(), userId)
                .orElseThrow(() -> new EntityNotFoundException("Wallet not found"));

        if (wallet.isVerified()) {
            throw new BusinessRuleViolationException("Wallet is already verified.");
        }

        final String key = "wallet:challenge:" + userId + ":" + wallet.getStellarPublicKey();
        final String nonce = redisTemplate.opsForValue().get(key);

        if (nonce == null) {
            throw new com.pactflow.infrastructure.web.exception.TokenExpiredException(
                    "Challenge has expired or does not exist. Please request a new challenge.");
        }

        try {
            final org.stellar.sdk.KeyPair keyPair = org.stellar.sdk.KeyPair.fromAccountId(wallet.getStellarPublicKey());
            final byte[] signatureBytes = java.util.Base64.getDecoder().decode(request.signature());
            
            if (!keyPair.verify(nonce.getBytes(java.nio.charset.StandardCharsets.UTF_8), signatureBytes)) {
                throw new com.pactflow.infrastructure.web.exception.AuthorizationException("Signature is invalid.");
            }
        } catch (Exception e) {
            throw new com.pactflow.infrastructure.web.exception.AuthorizationException(
                    "Failed to decode signature or public key.");
        }

        // Signature is valid, delete nonce and mark verified
        redisTemplate.delete(key);
        wallet.verify();
        walletRepository.save(wallet);
    }

    private void promoteOldestWallet(final UUID userId) {
        final List<Wallet> remainingWallets = walletRepository.findAllByUserId(userId);
        if (!remainingWallets.isEmpty()) {
            final Wallet oldest = remainingWallets.get(0); // Query already orders by createdAt ASC
            oldest.setPrimary(true);
            walletRepository.save(oldest);
        }
    }
}
