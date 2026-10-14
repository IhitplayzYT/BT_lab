package com.bank.calculator.client.mock;

import com.bank.calculator.client.ProductClient;
import com.bank.calculator.client.dto.ProductConfigDto;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Development mock for {@link ProductClient}.
 * Active when {@code mock.product-client=true} (set in application-dev.yml).
 *
 * <p>Returns a representative FD001 product configuration so that the
 * FD Calculator can run locally without the Product/Pricing Service.
 */
@Component
@Primary
@ConditionalOnProperty(name = "mock.product-client", havingValue = "true")
public class MockProductClient implements ProductClient {

    public MockProductClient() {
        System.out.println("MockProductClient: CONSTRUCTOR CALLED - MOCK IS ACTIVE!");
    }

    @Override
    public ProductConfigDto getCalculatorConfig(String productCode) {
        if ("INACTIVE001".equals(productCode)) {
            return buildInactiveProduct(productCode);
        }
        if ("NOTFOUND999".equals(productCode)) {
            // Simulate 404 by returning null — service layer handles it
            return null;
        }
        return buildDefaultProduct(productCode);
    }

    private ProductConfigDto buildDefaultProduct(String productCode) {
        ProductConfigDto dto = new ProductConfigDto();
        dto.setProductCode(productCode);
        dto.setProductName("Fixed Deposit - Short Term");
        dto.setProductType("FD");
        dto.setStatus("ACTIVE");
        dto.setCurrency("INR");
        dto.setMinPrincipal(new BigDecimal("1000.00"));
        dto.setMaxPrincipal(new BigDecimal("10000000.00"));
        dto.setBaseRate(new BigDecimal("6.50"));
        dto.setInterestType("COMPOUND");
        dto.setCompoundingFrequency("MONTHLY");
        dto.setSupportsPeriodicPayout(true);

        ProductConfigDto.TermLimit termLimit = new ProductConfigDto.TermLimit();
        termLimit.setMinMonths(3);
        termLimit.setMaxMonths(36);
        dto.setTermLimit(termLimit);

        ProductConfigDto.RateLimit rateLimit = new ProductConfigDto.RateLimit();
        rateLimit.setMinRate(new BigDecimal("5.00"));
        rateLimit.setMaxRate(new BigDecimal("7.50"));
        dto.setRateLimit(rateLimit);

        return dto;
    }

    private ProductConfigDto buildInactiveProduct(String productCode) {
        ProductConfigDto dto = buildDefaultProduct(productCode);
        dto.setStatus("INACTIVE");
        return dto;
    }
}
