package com.example.fdmodule.integration;

import com.example.fdmodule.dto.FDAccountRequest;
import com.example.fdmodule.entity.CustomerProfile;

import com.example.fdmodule.repository.CustomerProfileRepository;
import com.example.fdmodule.client.ProductServiceClient;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Shared fixtures: the Lab Manual's sample customer CUST001 and product FDSTD. */
final class TestData {

    static final String VALID_REQUEST_JSON = """
            {"customerId":"CUST001","productCode":"FDSTD","principalAmount":200000,
             "termMonths":12,"branchCode":"BR001"}""";

    private TestData() {
    }

    static void reset(JdbcTemplate jdbc, ProductServiceClient products, CustomerProfileRepository customers) {
        jdbc.update("DELETE FROM fd_transactions");
        jdbc.update("DELETE FROM fd_accounts");

        customers.deleteAll();
        // The real database has a users table; the H2 test schema does not, so create it and link customer1 to CUST001.
        jdbc.execute("CREATE TABLE IF NOT EXISTS users(id BIGINT AUTO_INCREMENT PRIMARY KEY,username VARCHAR(50) NOT NULL,"
                + "password_hash VARCHAR(255) NOT NULL,email VARCHAR(100) NULL,role VARCHAR(20) NOT NULL,"
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,CONSTRAINT uk_users_username UNIQUE(username))");
        jdbc.update("DELETE FROM users");
        jdbc.update("INSERT INTO users(username,password_hash,role) VALUES('customer1','x','CUSTOMER')");

        var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        var product = mapper.createObjectNode().put("productCode", "FDSTD").put("productType", "FD")
                .put("currency", "INR").put("status", "ACTIVE").put("effectiveDate", LocalDate.now().minusYears(1).toString())
                .put("minDeposit", 10000).put("maxDeposit", 10000000);
        product.putObject("termLimit").put("min", 6).put("max", 36);
        product.putObject("rateLimit").put("min", 6.5).put("max", 8.5);
        org.mockito.Mockito.when(products.getProductByCode(org.mockito.ArgumentMatchers.anyString())).thenReturn(product);
        org.mockito.Mockito.when(products.calculateRate(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyInt(), org.mockito.ArgumentMatchers.anyDouble()))
                .thenReturn(mapper.createObjectNode().put("finalRate", 6.5));

        CustomerProfile c = new CustomerProfile();
        c.setCustomerId("CUST001");
        c.setFullName("Test Customer");
        c.setCategory("GENERAL");
        c.setUserId(jdbc.queryForObject("SELECT id FROM users WHERE username='customer1'", Long.class));
        c.setCreatedAt(LocalDateTime.now());
        customers.save(c);
    }

    static FDAccountRequest validRequest() {
        FDAccountRequest r = new FDAccountRequest();
        r.setCustomerId("CUST001");
        r.setProductCode("FDSTD");
        r.setPrincipalAmount(new BigDecimal("200000"));
        r.setTermMonths(12);
        r.setBranchCode("BR001");
        return r;
    }
}
