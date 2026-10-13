package com.bank.calculator.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/**
 * Client-side DTO for the Customer Service categories response.
 * Isolated from business logic via the client package.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class CustomerCategoriesDto {

    private String customerId;
    private String username;
    private List<String> categories;

    public CustomerCategoriesDto() {
    }

    public CustomerCategoriesDto(String customerId, String username, List<String> categories) {
        this.customerId = customerId;
        this.username = username;
        this.categories = categories;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public List<String> getCategories() {
        return categories;
    }

    public void setCategories(List<String> categories) {
        this.categories = categories;
    }
}
