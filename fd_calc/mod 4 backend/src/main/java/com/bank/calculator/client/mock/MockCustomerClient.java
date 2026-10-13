package com.bank.calculator.client.mock;

import com.bank.calculator.client.CustomerClient;
import com.bank.calculator.client.dto.CustomerCategoriesDto;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Development mock for {@link CustomerClient}.
 * Active when {@code mock.customer-client=true} (set in application-dev.yml).
 *
 * <p>Returns SENIOR_CITIZEN and PREMIUM for any username so that bonus logic
 * can be exercised locally without the Customer Service.
 */
@Component
@Primary
@ConditionalOnProperty(name = "mock.customer-client", havingValue = "true")
public class MockCustomerClient implements CustomerClient {

    @Override
    public CustomerCategoriesDto getCustomerCategories(String username) {
        CustomerCategoriesDto dto = new CustomerCategoriesDto();
        dto.setCustomerId("CUST-MOCK-001");
        dto.setUsername(username);
        dto.setCategories(List.of("SENIOR_CITIZEN", "PREMIUM"));
        return dto;
    }
}
