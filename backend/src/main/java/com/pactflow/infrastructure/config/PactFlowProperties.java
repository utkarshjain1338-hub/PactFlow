package com.pactflow.infrastructure.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

/**
 * PactFlow application configuration properties.
 *
 * <p>Bound from the {@code pactflow.*} namespace in application.yml.
 * Authority: SYSTEM_ARCHITECTURE.md §13.4 (environment variables and secrets).
 *
 * <p>Validated at startup — the application will refuse to start if any
 * required property is missing or invalid. This is the fail-fast behavior
 * mandated by PROJECT_CONSTITUTION.md Rule 7 (production-ready).
 */
@ConfigurationProperties(prefix = "pactflow")
@Validated
@Getter
@Setter
public class PactFlowProperties {

    private Stellar stellar = new Stellar();
    private Security security = new Security();
    private Admin admin = new Admin();
    private Mail mail = new Mail();
    private Ingestion ingestion = new Ingestion();

    /**
     * Stellar network and Soroban RPC configuration.
     * Authority: SYSTEM_ARCHITECTURE.md §13.4
     */
    @Getter
    @Setter
    public static class Stellar {

        @NotBlank
        private String network = "testnet";

        @NotBlank
        private String networkPassphrase = "Test SDF Network ; September 2015";

        @NotBlank
        private String horizonUrl = "https://horizon-testnet.stellar.org";

        @NotBlank
        private String sorobanRpcUrl = "https://soroban-testnet.stellar.org";

        private String contractId = "";

        private String xlmTokenId = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
    }

    /**
     * Security configuration including JWT, CORS, and rate limiting.
     * Authority: SECURITY_THREAT_MODEL.md §13, API_SPECIFICATION.md §1.8
     */
    @Getter
    @Setter
    public static class Security {

        private Jwt jwt = new Jwt();
        private Cors cors = new Cors();
        private RateLimit rateLimit = new RateLimit();

        /** JWT token configuration per SYSTEM_ARCHITECTURE.md §8.2. */
        @Getter
        @Setter
        public static class Jwt {

            @NotBlank
            private String secretKey;

            @NotNull
            private Duration accessTokenTtl = Duration.ofMinutes(15);

            @NotNull
            private Duration refreshTokenTtl = Duration.ofDays(30);
        }

        /** CORS allowed origins per API_SPECIFICATION.md §1.10. */
        @Getter
        @Setter
        public static class Cors {

            @NotBlank
            private String allowedOrigins = "http://localhost:3000";
        }

        /** Rate limiting tiers per API_SPECIFICATION.md §1.8. */
        @Getter
        @Setter
        public static class RateLimit {

            @Min(1)
            private int globalUnauthenticatedRpm = 60;

            @Min(1)
            private int globalAuthenticatedRpm = 300;

            @Min(1)
            private int authEndpointsRpm = 10;

            @Min(1)
            private int forgotPasswordRph = 3;

            @Min(1)
            private int walletChallengeRpm = 5;

            @Min(1)
            private int mutationEndpointsRpm = 60;
        }
    }

    /**
     * Admin account configuration.
     * Authority: SECURITY_THREAT_MODEL.md §1.2 (Admin Stellar Private Key)
     */
    @Getter
    @Setter
    public static class Admin {

        private String walletAddress = "";
    }

    /** Email service configuration. */
    @Getter
    @Setter
    public static class Mail {

        @NotBlank
        private String fromAddress = "noreply@pactflow.io";
    }

    /**
     * Soroban event ingestion daemon configuration.
     * Authority: SYSTEM_ARCHITECTURE.md §6.4
     */
    @Getter
    @Setter
    public static class Ingestion {

        @Min(1)
        private int pollIntervalSeconds = 3;

        @Min(1)
        private int maxRetryAttempts = 5;
    }
}
