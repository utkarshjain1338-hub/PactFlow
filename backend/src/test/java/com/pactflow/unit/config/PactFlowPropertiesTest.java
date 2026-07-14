package com.pactflow.unit.config;

import com.pactflow.infrastructure.config.PactFlowProperties;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link PactFlowProperties}.
 *
 * <p>Verifies default configuration values and property structure per SYSTEM_ARCHITECTURE.md §13.4.
 */
@DisplayName("PactFlowProperties configuration values")
class PactFlowPropertiesTest {

    @Test
    @DisplayName("Should initialize with correct default values")
    void shouldInitializeWithCorrectDefaults() {
        final PactFlowProperties properties = new PactFlowProperties();

        // Stellar defaults
        assertThat(properties.getStellar().getNetwork()).isEqualTo("testnet");
        assertThat(properties.getStellar().getHorizonUrl()).isEqualTo("https://horizon-testnet.stellar.org");
        assertThat(properties.getStellar().getSorobanRpcUrl()).isEqualTo("https://soroban-testnet.stellar.org");
        assertThat(properties.getStellar().getContractId()).isEmpty();

        // Security / JWT defaults
        assertThat(properties.getSecurity().getJwt().getAccessTokenTtl()).isEqualTo(Duration.ofMinutes(15));
        assertThat(properties.getSecurity().getJwt().getRefreshTokenTtl()).isEqualTo(Duration.ofDays(30));
        assertThat(properties.getSecurity().getCors().getAllowedOrigins()).isEqualTo("http://localhost:3000");

        // Rate limit defaults
        assertThat(properties.getSecurity().getRateLimit().getGlobalUnauthenticatedRpm()).isEqualTo(60);
        assertThat(properties.getSecurity().getRateLimit().getGlobalAuthenticatedRpm()).isEqualTo(300);
        assertThat(properties.getSecurity().getRateLimit().getAuthEndpointsRpm()).isEqualTo(10);
        assertThat(properties.getSecurity().getRateLimit().getWalletChallengeRpm()).isEqualTo(5);
        assertThat(properties.getSecurity().getRateLimit().getMutationEndpointsRpm()).isEqualTo(60);

        // Admin defaults
        assertThat(properties.getAdmin().getWalletAddress()).isEmpty();

        // Mail defaults
        assertThat(properties.getMail().getFromAddress()).isEqualTo("noreply@pactflow.io");

        // Ingestion defaults
        assertThat(properties.getIngestion().getPollIntervalSeconds()).isEqualTo(3);
        assertThat(properties.getIngestion().getMaxRetryAttempts()).isEqualTo(5);
    }

    @Test
    @DisplayName("Should allow setting property values cleanly")
    void shouldAllowSettingPropertyValues() {
        final PactFlowProperties properties = new PactFlowProperties();

        properties.getStellar().setContractId("CB...TEST");
        properties.getSecurity().getJwt().setSecretKey("my-super-secret-key-that-is-at-least-256-bits-long");
        properties.getAdmin().setWalletAddress("GB...ADMIN");

        assertThat(properties.getStellar().getContractId()).isEqualTo("CB...TEST");
        assertThat(properties.getSecurity().getJwt().getSecretKey()).isEqualTo("my-super-secret-key-that-is-at-least-256-bits-long");
        assertThat(properties.getAdmin().getWalletAddress()).isEqualTo("GB...ADMIN");
    }
}
