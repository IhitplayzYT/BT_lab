package com.bank.product.security;

import com.bank.product.config.SecurityConfig;
import com.bank.product.controller.ProductController;
import com.bank.product.dto.ProductRequestDTO;
import com.bank.product.dto.ProductResponseDTO;
import com.bank.product.dto.RateLimitDTO;
import com.bank.product.dto.TermLimitDTO;
import com.bank.product.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {ProductController.class})
@Import(SecurityConfig.class)
public class ProductSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;



    @Autowired
    private ObjectMapper objectMapper;

    private ProductRequestDTO validRequest;
    private ProductResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        validRequest = ProductRequestDTO.builder()
                .productCode("FD001")
                .productName("Fixed Deposit - Short Term")
                .productType("FD")
                .currency("INR")
                .effectiveDate(LocalDate.of(2025, 7, 1))
                .status("ACTIVE")
                .termLimit(new TermLimitDTO(3, 36))
                .rateLimit(new RateLimitDTO(5.0, 7.5))
                .build();

        responseDTO = ProductResponseDTO.builder()
                .productId(1L)
                .productCode("FD001")
                .productName("Fixed Deposit - Short Term")
                .productType("FD")
                .currency("INR")
                .effectiveDate(LocalDate.of(2025, 7, 1))
                .status("ACTIVE")
                .build();
    }

    @Test
    void testUnauthenticatedRequest_Returns401() throws Exception {
        mockMvc.perform(get("/api/product/search"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testUnauthorizedRole_Returns403() throws Exception {
        String token = com.bank.product.TestTokens.token("user_john", List.of("UNRELATED"));

        mockMvc.perform(get("/api/product/search")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"));
    }

    @Test
    void testBankOfficer_CanCreateProduct_Returns201() throws Exception {
        // ProductController allows BANK_OFFICER and ADMIN to create products.
        String token = com.bank.product.TestTokens.token("officer_sarah", List.of("BANK_OFFICER"));

        mockMvc.perform(post("/api/product")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void testAdmin_CanCreateProduct_Returns201() throws Exception {
        when(productService.createProduct(any(ProductRequestDTO.class))).thenReturn(responseDTO);

        String token = com.bank.product.TestTokens.token("admin_super", List.of("ADMIN"));

        mockMvc.perform(post("/api/product")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productCode").value("FD001"));
    }

    @Test
    void testBankOfficer_CanSearchProducts_Returns200() throws Exception {
        when(productService.searchProducts(eq("FD"), any(), any(), any(), eq(0), eq(50), eq("productId")))
                .thenReturn(Collections.singletonList(responseDTO));

        String token = com.bank.product.TestTokens.token("officer_sarah", List.of("BANK_OFFICER"));

        mockMvc.perform(get("/api/product/search")
                        .param("productType", "FD")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].productCode").value("FD001"));
    }

    @Test
    void productServiceCannotMintTokens() throws Exception {
        mockMvc.perform(post("/api/auth/token").contentType(MediaType.APPLICATION_JSON)
            .content("{\"username\":\"test\",\"roles\":[\"ADMIN\"]}"))
            .andExpect(status().isUnauthorized());
    }
}
