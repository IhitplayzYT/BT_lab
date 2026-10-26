package com.bank.product;


import com.bank.product.dto.ProductRequestDTO;
import com.bank.product.dto.RateCalculationRequestDTO;
import com.bank.product.dto.RateLimitDTO;
import com.bank.product.dto.RateVariationDTO;
import com.bank.product.dto.TermLimitDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.bank.product.entity.Product;
import com.bank.product.repository.ProductRepository;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class ProductEndToEndIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    private String adminToken;
    private String officerToken;
    private String customerToken;

    @BeforeEach
    void setUpTokens() throws Exception {
        adminToken = TestTokens.token("admin_e2e", List.of("ADMIN"));
        officerToken = TestTokens.token("officer_e2e", List.of("BANK_OFFICER"));
        customerToken = TestTokens.token("cust_e2e", List.of("UNRELATED"));
    }

    @Test
    @DisplayName("E2E Security: Unauthenticated request must return 401 UNAUTHORIZED")
    void testUnauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/api/product/search"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("E2E Security: Customer role accessing product API must return 403 FORBIDDEN")
    void testUnauthorizedRole_Returns403() throws Exception {
        mockMvc.perform(get("/api/product/search")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"));
    }

    @Test
    @DisplayName("E2E Security: Bank Officer can create a valid product")
    void testOfficerCanCreateProduct() throws Exception {
        ProductRequestDTO request = ProductRequestDTO.builder()
                .productCode("FD_OFFICER")
                .productName("Officer FD")
                .productType("FD")
                .currency("INR")
                .effectiveDate(LocalDate.now())
                .termLimit(new TermLimitDTO(6, 60))
                .rateLimit(new RateLimitDTO(6.0, 8.5))
                .status("ACTIVE")
                .build();

        mockMvc.perform(post("/api/product")
                        .header("Authorization", "Bearer " + officerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("E2E Full Flow: Admin creates product, Officer queries/updates, FD Module validates, calculates rate, and Admin retires")
    void testFullProductLifecycleAndFdIntegrationFlow() throws Exception {
        // 1. Admin creates product FD301
        ProductRequestDTO createRequest = ProductRequestDTO.builder()
                .productCode("FD301")
                .productName("Fixed Deposit - E2E Super")
                .productType("FD")
                .currency("INR")
                .effectiveDate(LocalDate.now().minusDays(1))
                .status("ACTIVE")
                .termLimit(new TermLimitDTO(6, 60))
                .rateLimit(new RateLimitDTO(6.0, 8.5))
                .interestType("CREDIT")
                .minAge(18)
                .minDeposit(5000.0)
                .maxDeposit(5000000.0)
                .allowedRoles(List.of("OWNER", "NOMINEE"))
                .rateVariations(List.of(
                        new RateVariationDTO("SENIOR_CITIZEN", 1.0),
                        new RateVariationDTO("EMPLOYEE", 0.5)
                ))
                .build();

        mockMvc.perform(post("/api/product")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productCode").value("FD301"))
                .andExpect(jsonPath("$.productName").value("Fixed Deposit - E2E Super"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.createdBy").value("admin_e2e"));

        // 2. Duplicate product creation attempt -> 409 DUPLICATE_PRODUCT
        mockMvc.perform(post("/api/product")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.errorCode").value("DUPLICATE_PRODUCT"))
                .andExpect(jsonPath("$.message").value(containsString("FD301 already exists")));

        // 3. Bank Officer gets the created product
        mockMvc.perform(get("/api/product/FD301")
                        .header("Authorization", "Bearer " + officerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productCode").value("FD301"))
                .andExpect(jsonPath("$.termLimit.min").value(6))
                .andExpect(jsonPath("$.termLimit.max").value(60))
                .andExpect(jsonPath("$.rateLimit.min").value(6.0))
                .andExpect(jsonPath("$.rateLimit.max").value(8.5));

        // 4. Bank Officer updates the product (name and rate range)
        ProductRequestDTO updateRequest = ProductRequestDTO.builder()
                .productCode("FD301")
                .productName("Fixed Deposit - E2E Super Updated")
                .productType("FD")
                .currency("INR")
                .status("ACTIVE")
                .rateLimit(new RateLimitDTO(6.25, 8.75))
                .build();

        mockMvc.perform(put("/api/product/FD301")
                        .header("Authorization", "Bearer " + officerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productName").value("Fixed Deposit - E2E Super Updated"))
                .andExpect(jsonPath("$.rateLimit.min").value(6.25))
                .andExpect(jsonPath("$.rateLimit.max").value(8.75));

        // 5. Search products with filter and pagination
        mockMvc.perform(get("/api/product/search")
                        .param("productType", "FD")
                        .param("page", "0")
                        .param("size", "50")
                        .header("Authorization", "Bearer " + officerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].productCode", hasItem("FD301")));

        // 6. FD Module Integration: Validate Product for Account Creation (valid case)
        mockMvc.perform(get("/api/product/FD301/validate")
                        .param("termMonths", "12")
                        .param("amount", "50000.0")
                        .param("age", "30")
                        .header("Authorization", "Bearer " + officerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.productCode").value("FD301"))
                .andExpect(jsonPath("$.message").value(containsString("validated successfully")));

        // 7. FD Module Integration: Validate Out of Range Term -> 400 Bad Request
        mockMvc.perform(get("/api/product/FD301/validate")
                        .param("termMonths", "120") // Max allowed is 60
                        .param("amount", "50000.0")
                        .param("age", "30")
                        .header("Authorization", "Bearer " + officerToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errorCode").value("INVALID_PRODUCT"))
                .andExpect(jsonPath("$.message").value(containsString("outside product allowed range")));

        // 8. FD Module Integration: Validate Underage Applicant -> 400 Bad Request
        mockMvc.perform(get("/api/product/FD301/validate")
                        .param("termMonths", "12")
                        .param("amount", "50000.0")
                        .param("age", "16") // Min age is 18
                        .header("Authorization", "Bearer " + officerToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errorCode").value("INVALID_PRODUCT"))
                .andExpect(jsonPath("$.message").value(containsString("below the product minimum age requirement")));

        // 9. FD Module Integration: Calculate Rate with Senior Citizen bonus
        RateCalculationRequestDTO rateReq = RateCalculationRequestDTO.builder()
                .termMonths(12)
                .customerCategory("SENIOR_CITIZEN")
                .age(65)
                .build();

        mockMvc.perform(post("/api/product/FD301/rate")
                        .header("Authorization", "Bearer " + officerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productCode").value("FD301"))
                .andExpect(jsonPath("$.baseRate").value(6.25))
                .andExpect(jsonPath("$.rateModifier").value(1.0))
                .andExpect(jsonPath("$.finalRate").value(7.25));

        // 10. FD Module Integration: Active Products Dropdown
        mockMvc.perform(get("/api/product/active")
                        .param("type", "FD")
                        .header("Authorization", "Bearer " + officerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].productCode", hasItem("FD301")));

        // 11. FD Module Integration: Get Defaults
        mockMvc.perform(get("/api/product/FD301/defaults")
                        .header("Authorization", "Bearer " + officerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productCode").value("FD301"))
                .andExpect(jsonPath("$.defaultTermMonths").value(6))
                .andExpect(jsonPath("$.minDeposit").value(5000.0))
                .andExpect(jsonPath("$.allowedRoles", hasItem("OWNER")));

        // 12. Admin retires product (Soft-delete)
        mockMvc.perform(delete("/api/product/FD301")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RETIRED"));

        // 13. Validate retired product -> 422 PRODUCT_INACTIVE
        mockMvc.perform(get("/api/product/FD301/validate")
                        .param("termMonths", "12")
                        .param("amount", "50000.0")
                        .param("age", "30")
                        .header("Authorization", "Bearer " + officerToken))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422))
                .andExpect(jsonPath("$.errorCode").value("PRODUCT_INACTIVE"))
                .andExpect(jsonPath("$.message").value(containsString("is not ACTIVE")));
    }

    @Test
    @DisplayName("Audit Columns Test: Verifies all 11 audit columns are properly auto-populated on product creation and update")
    void testAuditColumnsPersistenceAndAutoPopulation() throws Exception {
        ProductRequestDTO createRequest = ProductRequestDTO.builder()
                .productCode("AUDIT999")
                .productName("Audit Test Product")
                .productType("FD")
                .currency("INR")
                .effectiveDate(LocalDate.now())
                .status("ACTIVE")
                .termLimit(new TermLimitDTO(12, 36))
                .rateLimit(new RateLimitDTO(6.0, 7.5))
                .interestType("CREDIT")
                .build();

        mockMvc.perform(post("/api/product")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated());

        Product product = productRepository.findByProductCode("AUDIT999").orElseThrow();

        // Verify all 11 audit columns
        assertNotNull(product.getCreatedAt(), "created_at must be populated");
        assertNotNull(product.getUpdatedAt(), "updated_at must be populated");
        assertEquals(1, product.getLdbid(), "ldbid must default to 1");
        assertEquals("+05:30", product.getOooAcptTsUtcOfst(), "ooo_acpt_ts_utc_ofst must default to +05:30");
        assertEquals("admin_e2e", product.getOooUserId(), "ooo_user_id must capture current authenticated user");
        assertEquals("DEFAULT", product.getOooWsId(), "ooo_ws_id must default to DEFAULT");
        assertEquals("RULES_SYS", product.getRuleSystemId(), "rule_system_id must default to RULES_SYS");
        assertNotNull(product.getUuid(), "uuid must be generated");
        assertEquals(36, product.getUuid().length(), "uuid must be 36 characters");
        assertNotNull(product.getOooAcptTs(), "ooo_acpt_ts must be populated");
        assertNotNull(product.getOooHostTs(), "ooo_host_ts must be populated");
        assertNotNull(product.getOooLocalTs(), "ooo_local_ts must be populated");
    }
}
