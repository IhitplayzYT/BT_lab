package com.bank.product.controller;

import com.bank.product.dto.*;
import com.bank.product.exception.DuplicateProductException;
import com.bank.product.exception.ProductNotFoundException;


import com.bank.product.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
@AutoConfigureMockMvc(addFilters = false) // Filters tested in ProductSecurityTest
public class ProductControllerTest {

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
                .minDeposit(5000.0)
                .maxDeposit(1000000.0)
                .minAge(18)
                .build();

        responseDTO = ProductResponseDTO.builder()
                .productId(1L)
                .productCode("FD001")
                .productName("Fixed Deposit - Short Term")
                .productType("FD")
                .currency("INR")
                .effectiveDate(LocalDate.of(2025, 7, 1))
                .status("ACTIVE")
                .termLimit(new TermLimitDTO(3, 36))
                .rateLimit(new RateLimitDTO(5.0, 7.5))
                .minDeposit(5000.0)
                .maxDeposit(1000000.0)
                .minAge(18)
                .build();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateProduct_Success() throws Exception {
        when(productService.createProduct(any(ProductRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(post("/api/product")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productId").value(1))
                .andExpect(jsonPath("$.productCode").value("FD001"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateProduct_DuplicateRejection() throws Exception {
        when(productService.createProduct(any(ProductRequestDTO.class)))
                .thenThrow(new DuplicateProductException("Product with code FD001 already exists"));

        mockMvc.perform(post("/api/product")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Product with code FD001 already exists"))
                .andExpect(jsonPath("$.errorCode").value("DUPLICATE_PRODUCT"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateProduct_ValidationFailure() throws Exception {
        validRequest.setCurrency("");

        mockMvc.perform(post("/api/product")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Currency is mandatory")))
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_FAILED"));
    }

    @Test
    @WithMockUser(roles = "BANK_OFFICER")
    void testUpdateProduct_Success() throws Exception {
        when(productService.updateProduct(eq("FD001"), any(ProductRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(put("/api/product/FD001")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productCode").value("FD001"));
    }

    @Test
    @WithMockUser(roles = "BANK_OFFICER")
    void testUpdateProduct_NotFound() throws Exception {
        when(productService.updateProduct(eq("FD002"), any(ProductRequestDTO.class)))
                .thenThrow(new ProductNotFoundException("Product with code FD002 not found"));

        mockMvc.perform(put("/api/product/FD002")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Product with code FD002 not found"))
                .andExpect(jsonPath("$.errorCode").value("PRODUCT_NOT_FOUND"));
    }

    @Test
    @WithMockUser(roles = "BANK_OFFICER")
    void testSearchProducts_Success() throws Exception {
        when(productService.searchProducts(eq("FD"), any(), any(), any(), eq(0), eq(50), eq("productId")))
                .thenReturn(Collections.singletonList(responseDTO));

        mockMvc.perform(get("/api/product/search")
                        .param("productType", "FD")
                        .param("startDate", "2025-01-01")
                        .param("endDate", "2025-12-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].productCode").value("FD001"));
    }

    @Test
    @WithMockUser(roles = "BANK_OFFICER")
    void testValidateProduct_Success() throws Exception {
        ProductValidationResponseDTO validationResponse = ProductValidationResponseDTO.builder()
                .valid(true)
                .productCode("FD001")
                .productName("Fixed Deposit - Short Term")
                .status("ACTIVE")
                .message("Product configuration and criteria validated successfully for account creation")
                .termMonths(12)
                .amount(50000.0)
                .age(30)
                .build();

        when(productService.validateProduct("FD001", 12, 50000.0, 30)).thenReturn(validationResponse);

        mockMvc.perform(get("/api/product/FD001/validate")
                        .param("termMonths", "12")
                        .param("amount", "50000.0")
                        .param("age", "30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.productCode").value("FD001"));
    }

    @Test
    @WithMockUser(roles = "BANK_OFFICER")
    void testCalculateRate_Success() throws Exception {
        RateCalculationRequestDTO req = RateCalculationRequestDTO.builder()
                .termMonths(12)
                .customerCategory("SENIOR_CITIZEN")
                .age(65)
                .build();

        RateCalculationResponseDTO res = RateCalculationResponseDTO.builder()
                .productCode("FD001")
                .productName("Fixed Deposit - Short Term")
                .termMonths(12)
                .customerCategory("SENIOR_CITIZEN")
                .baseRate(6.0)
                .rateModifier(1.0)
                .finalRate(7.0)
                .minRateLimit(5.0)
                .maxRateLimit(7.5)
                .build();

        when(productService.calculateFinalRate(eq("FD001"), any(RateCalculationRequestDTO.class))).thenReturn(res);

        mockMvc.perform(post("/api/product/FD001/rate")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.finalRate").value(7.0))
                .andExpect(jsonPath("$.customerCategory").value("SENIOR_CITIZEN"));
    }

    @Test
    @WithMockUser(roles = "BANK_OFFICER")
    void testGetProductDefaults_Success() throws Exception {
        ProductDefaultsResponseDTO defaults = ProductDefaultsResponseDTO.builder()
                .productCode("FD001")
                .productName("Fixed Deposit - Short Term")
                .productType("FD")
                .currency("INR")
                .defaultTermMonths(12)
                .defaultAmount(10000.0)
                .defaultRate(5.5)
                .allowedRoles(List.of("OWNER", "NOMINEE"))
                .build();

        when(productService.getProductDefaults("FD001")).thenReturn(defaults);

        mockMvc.perform(get("/api/product/FD001/defaults"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productCode").value("FD001"))
                .andExpect(jsonPath("$.defaultTermMonths").value(12));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testRetireProduct_Success() throws Exception {
        responseDTO.setStatus("RETIRED");
        when(productService.retireProduct("FD001")).thenReturn(responseDTO);

        mockMvc.perform(delete("/api/product/FD001")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RETIRED"));
    }
}
