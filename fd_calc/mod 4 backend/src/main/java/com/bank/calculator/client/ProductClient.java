package com.bank.calculator.client;

import com.bank.calculator.client.dto.ProductConfigDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign client for the Product/Pricing Service.
 *
 * <p>URL is configured via {@code services.product.base-url} in application.yml.
 * In the {@code dev} profile, this bean is replaced by {@link mock.MockProductClient}.
 */
@FeignClient(
    name = "product-service",
    url = "${services.product.base-url}",
    configuration = com.bank.calculator.config.FeignConfig.class
)
public interface ProductClient {

    /**
     * Retrieves calculator-specific configuration for a product.
     *
     * @param productCode the FD product code (e.g. "FD001")
     * @return calculator config DTO
     */
    @GetMapping("/internal/products/{productCode}/calculator-config")
    ProductConfigDto getCalculatorConfig(@PathVariable("productCode") String productCode);
}
