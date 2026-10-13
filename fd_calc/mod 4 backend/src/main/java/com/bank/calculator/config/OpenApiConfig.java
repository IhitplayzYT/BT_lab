package com.bank.calculator.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Springdoc / OpenAPI configuration.
 *
 * <ul>
 *   <li>Swagger UI:      {@code /swagger-ui/index.html}</li>
 *   <li>OpenAPI JSON:    {@code /v3/api-docs}</li>
 *   <li>Security scheme: {@code bearerAuth} (HTTP Bearer JWT)</li>
 * </ul>
 */
@Configuration
public class OpenApiConfig {

    @Value("${server.port:8084}")
    private int serverPort;

    public static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI fdCalculatorOpenApi() {
        return new OpenAPI()
            .info(new Info()
                .title("FD Calculator Service API")
                .version("1.0.0")
                .description("""
                    **Simulation-only** Fixed Deposit Calculator microservice – Banking Technology Lab.

                    This service calculates and explains estimated FD maturity values.
                    It does NOT create accounts, move funds, or schedule financial events.

                    ### Authentication
                    All `/api/v1/**` endpoints require a valid JWT with the `CUSTOMER` role.
                    Obtain a token from the Auth Service (`POST /auth/login`) and paste it
                    into the Authorize dialog (without the `Bearer ` prefix).
                    """)
                .contact(new Contact()
                    .name("Banking Technology Lab – Calculator Team")
                    .email("calc-team@bank.internal")
                    .url("http://localhost:" + serverPort + "/swagger-ui/index.html"))
            )
            .servers(List.of(
                new Server().url("/").description("Current Server / Gateway"),
                new Server().url("http://localhost:" + serverPort).description("Direct Local Server")
            ))
            .components(new Components()
                .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("Paste your JWT (without 'Bearer ' prefix)")
                )
            );
    }
}
