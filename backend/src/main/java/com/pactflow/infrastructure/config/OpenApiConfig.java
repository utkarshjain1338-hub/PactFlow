package com.pactflow.infrastructure.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Springdoc OpenAPI 2.x configuration.
 *
 * <p>Authority: PROJECT_CONSTITUTION.md §12 — "The Spring Boot backend must
 * auto-generate OpenAPI 3.0 documentation via Springdoc OpenAPI, available
 * at /swagger-ui.html in dev profiles."
 *
 * <p>Per API_SPECIFICATION.md §1.6 — JWT Bearer scheme documented.
 * OpenAPI UI is disabled in production (application-prod.yml).
 */
@Configuration
public class OpenApiConfig {

    /**
     * PactFlow OpenAPI specification bean.
     *
     * @param appVersion the application version from build metadata
     * @return fully configured OpenAPI spec with JWT security scheme
     */
    @Bean
    public OpenAPI pactFlowOpenApi(
            @Value("${spring.application.name:pactflow-api}") final String appName,
            @Value("${info.app.version:1.0.0-SNAPSHOT}") final String appVersion) {

        final String bearerSchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("PactFlow API")
                        .version(appVersion)
                        .description("""
                                PactFlow REST API — Milestone-based freelance escrow platform.

                                ## Authentication
                                All protected endpoints require a valid JWT Bearer token obtained from
                                `POST /api/v1/auth/login`. Include the token in the Authorization header:
                                `Authorization: Bearer <access_token>`

                                ## Rate Limiting
                                - Unauthenticated: 60 req/min per IP
                                - Authenticated: 300 req/min per user
                                - Auth endpoints: 10 req/min per IP

                                ## Error Format
                                All errors follow RFC 7807 Problem Details format.

                                ## Monetary Values
                                All XLM amounts are strings with 7 decimal places. Example: `"100.0000000"`.
                                """)
                        .contact(new Contact()
                                .name("PactFlow Engineering")
                                .email("engineering@pactflow.io")
                                .url("https://pactflow.io"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://pactflow.io/terms")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Local development"),
                        new Server()
                                .url("https://api.pactflow.io")
                                .description("Production")))
                .addSecurityItem(new SecurityRequirement().addList(bearerSchemeName))
                .components(new Components()
                        .addSecuritySchemes(bearerSchemeName, new SecurityScheme()
                                .name(bearerSchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT access token from POST /api/v1/auth/login")));
    }
}
