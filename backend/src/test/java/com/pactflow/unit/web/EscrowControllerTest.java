package com.pactflow.unit.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pactflow.application.escrow.EscrowService;
import com.pactflow.application.escrow.port.UnsignedTransaction;
import com.pactflow.domain.escrow.EscrowRepository;
import com.pactflow.domain.user.AccountType;
import com.pactflow.domain.user.Email;
import com.pactflow.domain.user.User;
import com.pactflow.infrastructure.web.controller.EscrowController;
import com.pactflow.infrastructure.web.security.JwtAuthenticationFilter;
import com.pactflow.infrastructure.web.security.RateLimitFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = EscrowController.class,
        excludeFilters = {
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
                        JwtAuthenticationFilter.class,
                        RateLimitFilter.class
                })
        }
)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("EscrowController WebMvc unit tests")
class EscrowControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EscrowService escrowService;

    @MockBean
    private EscrowRepository escrowRepository;

    private UUID userId;
    private User testUser;
    private UUID escrowId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        escrowId = UUID.randomUUID();
        testUser = new User(userId, new Email("test@pactflow.io"), "hash", AccountType.COMPANY, "Company", "UTC");

        // Mock security context
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(testUser, null, java.util.Collections.emptyList())
        );
    }

    @Test
    @DisplayName("POST /{id}/funding-transaction should return 200 OK")
    void buildFundingTransaction_Success() throws Exception {
        UnsignedTransaction mockTx = new UnsignedTransaction("base64xdrtx==", "TESTNET", 100L, 1000L, "funding");
        when(escrowService.buildFundingTransaction(eq(escrowId), eq(userId))).thenReturn(mockTx);

        mockMvc.perform(post("/escrows/{id}/funding-transaction", escrowId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionXdr").value("base64xdrtx=="));

        verify(escrowService).buildFundingTransaction(eq(escrowId), eq(userId));
    }

    @Test
    @DisplayName("POST /{id}/release should return 200 OK")
    void buildReleaseTransaction_Success() throws Exception {
        UnsignedTransaction mockTx = new UnsignedTransaction("base64xdrtx==", "TESTNET", 100L, 1000L, "release");
        when(escrowService.buildReleaseTransaction(eq(escrowId), eq(userId))).thenReturn(mockTx);

        mockMvc.perform(post("/escrows/{id}/release", escrowId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionXdr").value("base64xdrtx=="));

        verify(escrowService).buildReleaseTransaction(eq(escrowId), eq(userId));
    }

    @Test
    @DisplayName("POST /{id}/refund should return 200 OK")
    void buildRefundTransaction_Success() throws Exception {
        UnsignedTransaction mockTx = new UnsignedTransaction("base64xdrtx==", "TESTNET", 100L, 1000L, "refund");
        when(escrowService.buildRefundTransaction(eq(escrowId), eq(userId))).thenReturn(mockTx);

        mockMvc.perform(post("/escrows/{id}/refund", escrowId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionXdr").value("base64xdrtx=="));

        verify(escrowService).buildRefundTransaction(eq(escrowId), eq(userId));
    }
}
