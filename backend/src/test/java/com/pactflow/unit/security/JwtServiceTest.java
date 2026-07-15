package com.pactflow.unit.security;

import com.pactflow.domain.user.AccountType;
import com.pactflow.domain.user.Email;
import com.pactflow.domain.user.User;
import com.pactflow.infrastructure.config.PactFlowProperties;
import com.pactflow.infrastructure.web.security.JwtService;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("JwtService unit tests covering AT-04 and token generation")
class JwtServiceTest {

    private PactFlowProperties properties;
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        properties = new PactFlowProperties();
        properties.getSecurity().getJwt().setSecretKey("PactFlowSuperSecretSecureMasterKey32BytesExact!!");
        properties.getSecurity().getJwt().setAccessTokenTtl(Duration.ofMinutes(15));
        properties.getSecurity().getJwt().setRefreshTokenTtl(Duration.ofDays(30));

        jwtService = new JwtService(properties);
        jwtService.init();
    }

    @Test
    @DisplayName("AT-04: Should throw IllegalStateException if secret key length < 256 bits (32 bytes)")
    void shouldThrowWhenSecretKeyIsTooShort() {
        final PactFlowProperties shortProps = new PactFlowProperties();
        shortProps.getSecurity().getJwt().setSecretKey("ShortKey123");
        final JwtService shortService = new JwtService(shortProps);

        assertThatThrownBy(shortService::init)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("at least 256 bits (32 bytes)");
    }

    @Test
    @DisplayName("Should generate valid signed JWT containing required subject and session claims")
    void shouldGenerateAndValidateAccessToken() {
        final UUID userId = UUID.randomUUID();
        final UUID sessionId = UUID.randomUUID();
        final User user = new User(userId, new Email("freelancer@pactflow.io"), "hash", AccountType.FREELANCER, "Alice", "UTC");

        final String token = jwtService.generateAccessToken(user, sessionId);
        assertThat(token).isNotBlank().contains(".");

        final Optional<Claims> optClaims = jwtService.parseAndValidateClaims(token);
        assertThat(optClaims).isPresent();
        final Claims claims = optClaims.get();
        assertThat(claims.getSubject()).isEqualTo(userId.toString());
        assertThat(claims.get("email", String.class)).isEqualTo("freelancer@pactflow.io");
        assertThat(claims.get("accountType", String.class)).isEqualTo("FREELANCER");
        assertThat(claims.get("sessionId", String.class)).isEqualTo(sessionId.toString());
    }

    @Test
    @DisplayName("Should generate opaque 256-bit (64-character hex) refresh tokens")
    void shouldGenerateRefreshToken() {
        final String token1 = jwtService.generateRefreshToken();
        final String token2 = jwtService.generateRefreshToken();

        assertThat(token1).hasSize(64).matches("^[a-f0-9]{64}$");
        assertThat(token2).hasSize(64).matches("^[a-f0-9]{64}$");
        assertThat(token1).isNotEqualTo(token2);
    }
}
