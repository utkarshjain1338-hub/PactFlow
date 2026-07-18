package com.pactflow.unit.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pactflow.application.auth.dto.UserSummaryDto;
import com.pactflow.application.wallet.WalletService;
import com.pactflow.application.wallet.dto.AddWalletRequest;
import com.pactflow.application.wallet.dto.ChallengeRequest;
import com.pactflow.application.wallet.dto.ChallengeResponse;
import com.pactflow.application.wallet.dto.VerifyWalletRequest;
import com.pactflow.application.wallet.dto.WalletResponse;
import com.pactflow.domain.user.AccountType;
import com.pactflow.domain.wallet.WalletProvider;
import com.pactflow.infrastructure.web.controller.WalletController;
import com.pactflow.infrastructure.web.exception.BusinessRuleViolationException;
import com.pactflow.infrastructure.web.exception.EntityNotFoundException;
import com.pactflow.infrastructure.web.exception.GlobalExceptionHandler;
import com.pactflow.infrastructure.web.security.JwtAuthenticationFilter;
import com.pactflow.infrastructure.web.security.RateLimitFilter;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = WalletController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@DisplayName("WalletController WebMvc unit tests")
class WalletControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private WalletService walletService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private RateLimitFilter rateLimitFilter;

    private UUID userId;
    private UUID walletId;
    private String stellarPublicKey;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        walletId = UUID.randomUUID();
        stellarPublicKey = org.stellar.sdk.KeyPair.random().getAccountId();
        final UserSummaryDto principal = UserSummaryDto.builder()
                .id(userId)
                .email("test@pactflow.io")
                .accountType(AccountType.FREELANCER)
                .displayName("Test User")
                .build();

        final UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal, null, List.of(new SimpleGrantedAuthority("ROLE_FREELANCER")));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // ─── GET /api/v1/users/me/wallets ─────────────────────────────────────────

    @Test
    @DisplayName("GET /api/v1/users/me/wallets should return 200 OK")
    void getWallets_Success() throws Exception {
        final WalletResponse response = WalletResponse.builder()
                .id(walletId)
                .stellarPublicKey(stellarPublicKey)
                .provider(WalletProvider.FREIGHTER)
                .isPrimary(true)
                .isVerified(true)
                .createdAt(Instant.now())
                .build();
        when(walletService.getWallets(userId)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/users/me/wallets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(walletId.toString()))
                .andExpect(jsonPath("$[0].stellarPublicKey").value(stellarPublicKey));
    }

    @Test
    @DisplayName("GET /api/v1/users/me/wallets unauthenticated should return 401")
    void getWallets_Unauthenticated() throws Exception {
        SecurityContextHolder.clearContext();
        mockMvc.perform(get("/api/v1/users/me/wallets"))
                .andExpect(status().isUnauthorized());
    }

    // ─── POST /api/v1/users/me/wallets ────────────────────────────────────────

    @Test
    @DisplayName("POST /api/v1/users/me/wallets should return 201 Created")
    void addWallet_Success() throws Exception {
        final AddWalletRequest request = new AddWalletRequest(stellarPublicKey, WalletProvider.FREIGHTER);
        final WalletResponse response = WalletResponse.builder()
                .id(walletId)
                .stellarPublicKey(stellarPublicKey)
                .provider(WalletProvider.FREIGHTER)
                .isPrimary(false)
                .isVerified(false)
                .createdAt(Instant.now())
                .build();

        when(walletService.addWallet(eq(userId), any(AddWalletRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/users/me/wallets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(walletId.toString()));
    }

    @Test
    @DisplayName("POST /api/v1/users/me/wallets should return 422 on invalid public key")
    void addWallet_ValidationFailed() throws Exception {
        final AddWalletRequest request = new AddWalletRequest("invalid_key", WalletProvider.FREIGHTER);

        mockMvc.perform(post("/api/v1/users/me/wallets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.title").value("Validation Failed"));
    }

    @Test
    @DisplayName("POST /api/v1/users/me/wallets should return 409 Duplicate")
    void addWallet_Duplicate() throws Exception {
        final AddWalletRequest request = new AddWalletRequest(stellarPublicKey, WalletProvider.FREIGHTER);
        when(walletService.addWallet(eq(userId), any(AddWalletRequest.class)))
                .thenThrow(new org.springframework.dao.DataIntegrityViolationException("duplicate key"));

        mockMvc.perform(post("/api/v1/users/me/wallets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    // ─── POST /api/v1/users/me/wallets/challenge ──────────────────────────────

    @Test
    @DisplayName("POST /challenge should return 200 OK")
    void generateChallenge_Success() throws Exception {
        final ChallengeRequest request = new ChallengeRequest(walletId);
        final ChallengeResponse response = new ChallengeResponse("nonce123", Instant.now().plusSeconds(600).getEpochSecond());

        when(walletService.generateChallenge(userId, walletId)).thenReturn(response);

        mockMvc.perform(post("/api/v1/users/me/wallets/challenge")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nonce").value("nonce123"));
    }

    @Test
    @DisplayName("POST /challenge should return 404 for wrong owner")
    void generateChallenge_WrongOwner() throws Exception {
        final ChallengeRequest request = new ChallengeRequest(walletId);
        when(walletService.generateChallenge(userId, walletId)).thenThrow(new EntityNotFoundException("Wallet not found"));

        mockMvc.perform(post("/api/v1/users/me/wallets/challenge")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /challenge should return 423 if locked")
    void generateChallenge_Locked() throws Exception {
        final ChallengeRequest request = new ChallengeRequest(walletId);
        when(walletService.generateChallenge(userId, walletId)).thenThrow(new com.pactflow.application.wallet.exception.WalletLockedException("locked"));

        mockMvc.perform(post("/api/v1/users/me/wallets/challenge")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isLocked());
    }

    // ─── POST /api/v1/users/me/wallets/verify ─────────────────────────────────

    @Test
    @DisplayName("POST /verify should return 204 No Content")
    void verifyWallet_Success() throws Exception {
        final VerifyWalletRequest request = new VerifyWalletRequest(walletId, "signature");

        mockMvc.perform(post("/api/v1/users/me/wallets/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("POST /verify should return 422 validation failure")
    void verifyWallet_ValidationFailure() throws Exception {
        final VerifyWalletRequest request = new VerifyWalletRequest(null, "signature");

        mockMvc.perform(post("/api/v1/users/me/wallets/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @DisplayName("POST /verify should return 403 Forbidden for bad signature")
    void verifyWallet_Forbidden() throws Exception {
        final VerifyWalletRequest request = new VerifyWalletRequest(walletId, "bad_sig");
        doThrow(new com.pactflow.infrastructure.web.exception.AuthorizationException("Invalid")).when(walletService).verifyWallet(eq(userId), any(VerifyWalletRequest.class));

        mockMvc.perform(post("/api/v1/users/me/wallets/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    // ─── PATCH /api/v1/users/me/wallets/{id}/primary ──────────────────────────

    @Test
    @DisplayName("PATCH /primary should return 204 No Content")
    void setPrimary_Success() throws Exception {
        mockMvc.perform(patch("/api/v1/users/me/wallets/" + walletId + "/primary"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("PATCH /primary should return 409 if unverified")
    void setPrimary_ConflictUnverified() throws Exception {
        doThrow(new BusinessRuleViolationException("Unverified")).when(walletService).setPrimaryWallet(userId, walletId);
        
        mockMvc.perform(patch("/api/v1/users/me/wallets/" + walletId + "/primary"))
                .andExpect(status().isConflict());
    }

    // ─── DELETE /api/v1/users/me/wallets/{id} ─────────────────────────────────

    @Test
    @DisplayName("DELETE /wallet should return 204 No Content")
    void deleteWallet_Success() throws Exception {
        mockMvc.perform(delete("/api/v1/users/me/wallets/" + walletId))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /wallet should return 404 for wrong owner")
    void deleteWallet_NotFound() throws Exception {
        doThrow(new EntityNotFoundException("Wallet not found")).when(walletService).deleteWallet(userId, walletId);

        mockMvc.perform(delete("/api/v1/users/me/wallets/" + walletId))
                .andExpect(status().isNotFound());
    }
}
