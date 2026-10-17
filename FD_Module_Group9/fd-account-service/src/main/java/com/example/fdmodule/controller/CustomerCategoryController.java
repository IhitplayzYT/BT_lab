package com.example.fdmodule.controller;

import com.example.fdmodule.repository.CustomerProfileRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/internal/customers")
public class CustomerCategoryController {
    private final CustomerProfileRepository customers;
    public CustomerCategoryController(CustomerProfileRepository customers) { this.customers = customers; }

    @GetMapping("/{username}/categories")
    @PreAuthorize("hasAnyRole('BANK_OFFICER','ADMIN')")
    public Map<String, Object> categories(@PathVariable String username) {
        var customer = customers.findById(username).or(() -> customers.findByUsername(username));
        String category = customer.map(c -> c.getCategory()).orElse("GENERAL");
        if (category == null || category.isBlank()) category = "GENERAL";
        if (category.equalsIgnoreCase("SENIOR")) category = "SENIOR_CITIZEN";
        return Map.of("username", username, "customerId", customer.map(c -> c.getCustomerId()).orElse(username),
                "categories", List.of(category.toUpperCase()));
    }
}
