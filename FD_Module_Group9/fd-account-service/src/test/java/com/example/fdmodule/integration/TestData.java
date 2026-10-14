package com.example.fdmodule.integration;

import com.example.fdmodule.dto.FDAccountRequest;
import com.example.fdmodule.entity.CustomerProfile;
import com.example.fdmodule.entity.Product;
import com.example.fdmodule.repository.CustomerProfileRepository;
import com.example.fdmodule.repository.ProductRepository;
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

    static void reset(JdbcTemplate jdbc, ProductRepository products, CustomerProfileRepository customers) {
        jdbc.update("DELETE FROM fd_transactions");
        jdbc.update("DELETE FROM fd_accounts");
        products.deleteAll();
        customers.deleteAll();
        // The real database has a users table; the H2 test schema does not, so create it and link customer1 to CUST001.
        jdbc.execute("CREATE TABLE IF NOT EXISTS users(id BIGINT AUTO_INCREMENT PRIMARY KEY,username VARCHAR(50) NOT NULL,"
                + "password_hash VARCHAR(255) NOT NULL,email VARCHAR(100) NULL,role VARCHAR(20) NOT NULL,"
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,CONSTRAINT uk_users_username UNIQUE(username))");
        jdbc.update("DELETE FROM users");
        jdbc.update("INSERT INTO users(username,password_hash,role) VALUES('customer1','x','CUSTOMER')");

        Product p = new Product();
        p.setProductCode("FDSTD");
        p.setProductName("Fixed Deposit - Standard");
        p.setProductType("FD");
        p.setCurrency("INR");
        p.setEffectiveDate(LocalDate.now().minusYears(1));
        p.setMinTermMonths(6);
        p.setMaxTermMonths(36);
        p.setMinRate(new BigDecimal("6.50"));
        p.setMaxRate(new BigDecimal("8.50"));
        p.setMinDeposit(new BigDecimal("10000.00"));
        p.setRateCapAddon(new BigDecimal("2.00"));
        p.setPreMaturityPenaltyPct(new BigDecimal("1.00"));
        p.setCompoundingFrequency("QUARTERLY");
        p.setStatus("ACTIVE");
        p.setCreatedAt(LocalDateTime.now());
        p.setCreatedBy("admin1");
        products.save(p);

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
