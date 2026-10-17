package com.bank.product.service;

import com.bank.product.dto.*;
import com.bank.product.entity.*;
import com.bank.product.exception.DuplicateProductException;
import com.bank.product.exception.InvalidProductException;
import com.bank.product.exception.ProductInactiveException;
import com.bank.product.mapper.ProductMapper;
import com.bank.product.repository.ProductRepository;
import com.bank.product.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Spy
    private ProductMapper productMapper = new ProductMapper();

    @InjectMocks
    private ProductServiceImpl productService;

    private ProductRequestDTO validRequest;
    private Product existingFdProduct;

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
                .maxDeposit(10000000.0)
                .minAge(18)
                .interestType("CREDIT")
                .build();

        List<ProductBusinessRule> rules = new ArrayList<>();
        rules.add(ProductBusinessRule.builder()
                .ruleId(1)
                .termLimitMin(3)
                .termLimitMax(36)
                .rateLimitMin(5.50)
                .rateLimitMax(7.50)
                .build());

        List<RateVariation> variations = new ArrayList<>();
        variations.add(RateVariation.builder()
                .customerCategory("SENIOR_CITIZEN")
                .rateModifier(1.00)
                .build());
        variations.add(RateVariation.builder()
                .customerCategory("EMPLOYEE")
                .rateModifier(0.50)
                .build());

        existingFdProduct = Product.builder()
                .productId(1)
                .productCode("FD001")
                .productName("Fixed Deposit - Short Term")
                .productType("FD")
                .currency("INR")
                .effectiveDate(LocalDate.of(2025, 1, 1))
                .status(ProductStatus.ACTIVE)
                .isActive(true)
                .minAge(18)
                .minDeposit(5000.0)
                .maxDeposit(10000000.0)
                .businessRules(rules)
                .rateVariations(variations)
                .build();
    }

    @Test
    void testCreateProduct_Success() {
        when(productRepository.findByProductCode("FD001")).thenReturn(Optional.empty());
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            p.setProductId(1);
            return p;
        });

        ProductResponseDTO response = productService.createProduct(validRequest);

        assertNotNull(response);
        assertEquals(1L, response.getProductId());
        assertEquals("FD001", response.getProductCode());
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void testCreateProduct_DuplicateCode() {
        Product existing = Product.builder().productCode("FD001").build();
        when(productRepository.findByProductCode("FD001")).thenReturn(Optional.of(existing));

        assertThrows(DuplicateProductException.class, () -> productService.createProduct(validRequest));
        verify(productRepository, never()).save(any());
    }

    @Test
    void testCreateProduct_InvalidTermRange() {
        validRequest.setTermLimit(new TermLimitDTO(36, 3)); // min > max

        InvalidProductException exception = assertThrows(InvalidProductException.class,
                () -> productService.createProduct(validRequest));
        assertTrue(exception.getMessage().contains("Minimum term cannot be greater than maximum term"));
        verify(productRepository, never()).save(any());
    }

    @Test
    void testCreateProduct_InvalidInterestRange() {
        validRequest.setRateLimit(new RateLimitDTO(7.5, 5.0)); // min > max

        InvalidProductException exception = assertThrows(InvalidProductException.class,
                () -> productService.createProduct(validRequest));
        assertTrue(exception.getMessage().contains("Minimum interest cannot be greater than maximum interest"));
        verify(productRepository, never()).save(any());
    }

    @Test
    void testCreateProduct_MissingCurrency() {
        validRequest.setCurrency(null);

        InvalidProductException exception = assertThrows(InvalidProductException.class,
                () -> productService.createProduct(validRequest));
        assertTrue(exception.getMessage().contains("Currency is mandatory"));
        verify(productRepository, never()).save(any());
    }

    @Test
    void testCreateProduct_InvalidStatus() {
        validRequest.setStatus("INVALID_STATUS");

        InvalidProductException exception = assertThrows(InvalidProductException.class,
                () -> productService.createProduct(validRequest));
        assertTrue(exception.getMessage().contains("Status must be ACTIVE or INACTIVE only"));
        verify(productRepository, never()).save(any());
    }

    @Test
    void testCreateProduct_InvalidDateRange() {
        validRequest.setEffectiveDate(LocalDate.of(2025, 12, 31));
        validRequest.setEndDate(LocalDate.of(2025, 1, 1));

        InvalidProductException exception = assertThrows(InvalidProductException.class,
                () -> productService.createProduct(validRequest));
        assertTrue(exception.getMessage().contains("Effective date cannot be after end date"));
        verify(productRepository, never()).save(any());
    }

    @Test
    void testCreateProduct_MismatchedInterestType() {
        validRequest.setProductType("LOAN");
        validRequest.setInterestType("CREDIT"); // Loans must be DEBIT

        InvalidProductException exception = assertThrows(InvalidProductException.class,
                () -> productService.createProduct(validRequest));
        assertTrue(exception.getMessage().contains("Interest type must be DEBIT for loans"));
        verify(productRepository, never()).save(any());
    }

    @Test
    void testValidateProduct_Success() {
        when(productRepository.findByProductCode("FD001")).thenReturn(Optional.of(existingFdProduct));

        ProductValidationResponseDTO result = productService.validateProduct("FD001", 12, 50000.0, 25);

        assertNotNull(result);
        assertTrue(result.isValid());
        assertEquals("FD001", result.getProductCode());
    }

    @Test
    void testValidateProduct_InactiveProductThrows422() {
        existingFdProduct.setStatus(ProductStatus.SUSPENDED);
        when(productRepository.findByProductCode("FD001")).thenReturn(Optional.of(existingFdProduct));

        assertThrows(ProductInactiveException.class, () ->
                productService.validateProduct("FD001", 12, 50000.0, 25));
    }

    @Test
    void testValidateProduct_TermOutOfRangeThrows() {
        when(productRepository.findByProductCode("FD001")).thenReturn(Optional.of(existingFdProduct));

        InvalidProductException ex = assertThrows(InvalidProductException.class, () ->
                productService.validateProduct("FD001", 60, 50000.0, 25)); // 60 months > max 36
        assertTrue(ex.getMessage().contains("outside product allowed range"));
    }

    @Test
    void testValidateProduct_UnderageApplicantThrows() {
        when(productRepository.findByProductCode("FD001")).thenReturn(Optional.of(existingFdProduct));

        InvalidProductException ex = assertThrows(InvalidProductException.class, () ->
                productService.validateProduct("FD001", 12, 50000.0, 16)); // 16 < minAge 18
        assertTrue(ex.getMessage().contains("below the product minimum age requirement"));
    }

    @Test
    void testCalculateFinalRate_SeniorCitizenModifier() {
        when(productRepository.findByProductCode("FD001")).thenReturn(Optional.of(existingFdProduct));

        RateCalculationRequestDTO request = RateCalculationRequestDTO.builder()
                .termMonths(12)
                .customerCategory("SENIOR_CITIZEN")
                .age(65)
                .build();

        RateCalculationResponseDTO rateRes = productService.calculateFinalRate("FD001", request);

        assertNotNull(rateRes);
        // Base rate is 5.50, modifier is 1.00 -> 6.50
        assertEquals(5.50, rateRes.getBaseRate());
        assertEquals(1.00, rateRes.getRateModifier());
        assertEquals(6.50, rateRes.getFinalRate());
    }

    @Test
    void testCalculateFinalRate_ClampedToMaximumRate() {
        // Change variation to 3.0 so base (5.5) + modifier (3.0) = 8.5 > max (7.5)
        existingFdProduct.getRateVariations().get(0).setRateModifier(3.0);
        when(productRepository.findByProductCode("FD001")).thenReturn(Optional.of(existingFdProduct));

        RateCalculationRequestDTO request = RateCalculationRequestDTO.builder()
                .termMonths(12)
                .customerCategory("SENIOR_CITIZEN")
                .build();

        RateCalculationResponseDTO rateRes = productService.calculateFinalRate("FD001", request);

        assertNotNull(rateRes);
        // Clamped at maxRateLimit 7.50
        assertEquals(7.50, rateRes.getFinalRate());
    }

    @Test
    void testRetireProduct_Success() {
        when(productRepository.findByProductCode("FD001")).thenReturn(Optional.of(existingFdProduct));
        when(productRepository.save(any(Product.class))).thenReturn(existingFdProduct);

        ProductResponseDTO retired = productService.retireProduct("FD001");

        assertNotNull(retired);
        assertEquals(ProductStatus.RETIRED, existingFdProduct.getStatus());
        verify(productRepository, times(1)).save(existingFdProduct);
    }

    @Test
    void testGetProductDefaults_Success() {
        when(productRepository.findByProductCode("FD001")).thenReturn(Optional.of(existingFdProduct));

        ProductDefaultsResponseDTO defaults = productService.getProductDefaults("FD001");

        assertNotNull(defaults);
        assertEquals("FD001", defaults.getProductCode());
        assertEquals(3, defaults.getMinTermMonths());
        assertEquals(36, defaults.getMaxTermMonths());
        assertEquals(5000.0, defaults.getMinDeposit());
    }
}
