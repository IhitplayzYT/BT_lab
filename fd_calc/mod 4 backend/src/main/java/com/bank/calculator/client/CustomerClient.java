package com.bank.calculator.client;

import com.bank.calculator.client.dto.CustomerCategoriesDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign client for the Customer Service.
 *
 * <p>URL is configured via {@code services.customer.base-url} in application.yml.
 * In the {@code dev} profile, this bean is replaced by {@link mock.MockCustomerClient}.
 */
@FeignClient(
    name = "customer-service",
    url = "${services.customer.base-url}",
    configuration = com.bank.calculator.config.FeignConfig.class,
    primary = false
)
public interface CustomerClient {

    /**
     * Retrieves authoritative customer categories.
     * The Calculator calls this to determine category bonuses.
     * Never called with user-supplied category data.
     *
     * @param username the authenticated customer's username from the JWT
     * @return customer categories DTO
     */
    @GetMapping("/internal/customers/{username}/categories")
    CustomerCategoriesDto getCustomerCategories(@PathVariable("username") String username);
}
