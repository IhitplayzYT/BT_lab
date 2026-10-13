package com.bank.product.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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

    @Value("${server.port:8080}")
    private int serverPort;

    public static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI productOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Product & Pricing Service API")
                        .version("1.0.0")
                        .description("""
                            Banking Product & Pricing microservice – Banking Technology Lab.

                            This service defines banking products, encapsulates business limits and rate formulas,
                            and exposes integration endpoints for FD creation.

                            ### Authentication
                            All `/api/v1/**` endpoints require a valid JWT with the `CUSTOMER` role.
                            Obtain a token from the Auth Service (`POST /auth/login`) and paste it
                            into the Authorize dialog (without the `Bearer ` prefix).
                            """)
                        .contact(new Contact()
                                .name("Banking Technology Lab – Product Team")
                                .email("product-team@bank.internal")
                                .url("http://localhost:" + serverPort + "/swagger-ui/index.html"))
                        .license(new License().name("Apache 2.0").url("https://springdoc.org")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH,
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Paste your JWT (without 'Bearer ' prefix)")));
    }
}
