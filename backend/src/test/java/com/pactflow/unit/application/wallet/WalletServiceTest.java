package com.pactflow.unit.application.wallet;

import com.pactflow.application.wallet.WalletService;
import com.pactflow.application.wallet.dto.VerifyWalletRequest;
import com.pactflow.domain.wallet.Wallet;
import com.pactflow.infrastructure.persistence.WalletRepository;
import com.pactflow.infrastructure.web.exception.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private StringRedisTemplate redisTemplate;
    
    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private WalletService walletService;

    @Test
    @DisplayName("User B attempting to verify User A's wallet challenge should return 404 EntityNotFound")
    void verifyWallet_whenCalledByDifferentUser_throwsEntityNotFoundException() {
        // Arrange
        final UUID userAId = UUID.randomUUID();
        final UUID userBId = UUID.randomUUID();
        final UUID walletId = UUID.randomUUID();
        
        final VerifyWalletRequest request = new VerifyWalletRequest(walletId, "some-base64-signature");
        
        // Mock redis lock check to pass
        lenient().when(redisTemplate.hasKey(WalletService.WALLET_LOCK_PREFIX + userBId)).thenReturn(false);

        // When User B attempts to verify the wallet, the repository looks for a wallet matching BOTH walletId and userBId
        // Because the wallet belongs to user A, this returns empty.
        when(walletRepository.findByIdAndUserId(walletId, userBId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> walletService.verifyWallet(userBId, request));
        
        // Verify that we never checked the signature or updated the wallet
        verify(walletRepository, never()).save(any(Wallet.class));
    }
}
