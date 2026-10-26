package com.bank.fdcalculator.service;

import com.bank.fdcalculator.client.ProductClient;
import com.bank.fdcalculator.dto.FdCalculationRequestDTO;
import com.bank.fdcalculator.dto.FdCalculationResponseDTO;
import com.bank.fdcalculator.dto.FdTermDTO;
import com.bank.fdcalculator.exception.InvalidCalculationInputException;
import com.bank.fdcalculator.exception.UnknownCategoryException;
import com.bank.fdcalculator.service.impl.FdCalculatorServiceImpl;
import com.bank.product.dto.ProductResponseDTO;
import com.bank.product.dto.RateLimitDTO;
import com.bank.product.dto.RateVariationDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class FdCalculatorServiceTest {

    @Mock
    private ProductClient productClient;

    @Mock
    private com.bank.fdcalculator.repository.FdCalculationRepository fdCalculationRepository;

    private FdCalculatorService fdCalculatorService;

    @BeforeEach
    void setUp() {
        fdCalculatorService = new FdCalculatorServiceImpl(productClient, fdCalculationRepository);
    }

    @Test
    void testCalculateSimpleInterest_Success() {
        // Request: Principal=100000, Term=12 months, baseRate=6.5, categories=None, type=SIMPLE
        FdCalculationRequestDTO request = new FdCalculationRequestDTO(
                BigDecimal.valueOf(100000),
                new FdTermDTO(12, "months"),
                6.5,
                null,
                List.of(),
                "SIMPLE",
                null
        );

        FdCalculationResponseDTO response = fdCalculatorService.calculateMaturity(request);

        assertNotNull(response);
        assertEquals(Double.valueOf(6.5), response.getEffectiveRate());
        assertEquals(0, response.getMaturityAmount().compareTo(BigDecimal.valueOf(106500.00)));
        assertEquals(0, response.getInterestEarned().compareTo(BigDecimal.valueOf(6500.00)));
    }

    @Test
    void testCalculateCompoundInterest_Success() {
        // Request: Principal=100000, Term=1 year, baseRate=6.5, compounding=4 (quarterly), type=COMPOUND
        FdCalculationRequestDTO request = new FdCalculationRequestDTO(
                BigDecimal.valueOf(100000),
                new FdTermDTO(1, "years"),
                6.5,
                null,
                List.of(),
                "COMPOUND",
                4
        );

        FdCalculationResponseDTO response = fdCalculatorService.calculateMaturity(request);

        // M = P * (1 + r / (n * 100))^(n * t)
        // M = 100000 * (1 + 6.5 / 400)^4 = 100000 * (1.01625)^4 = 106660.16
        assertNotNull(response);
        assertEquals(Double.valueOf(6.5), response.getEffectiveRate());
        assertEquals(0, response.getMaturityAmount().compareTo(BigDecimal.valueOf(106660.16)));
        assertEquals(0, response.getInterestEarned().compareTo(BigDecimal.valueOf(6660.16)));
    }

    @Test
    void testCategoryStackingUnderCap() {
        // Request: baseRate=5.0, categories=["EMPLOYEE"] -> +0.5%
        // Effective rate should be 5.5%
        mockCatalogProduct("FD-CATEGORY-TEST", 5.0, 7.0,
                new RateVariationDTO("EMPLOYEE", 0.5));
        FdCalculationRequestDTO request = new FdCalculationRequestDTO(
                BigDecimal.valueOf(100000),
                new FdTermDTO(2, "years"),
                5.0,
                "FD-CATEGORY-TEST",
                List.of("EMPLOYEE"),
                "SIMPLE",
                null
        );

        FdCalculationResponseDTO response = fdCalculatorService.calculateMaturity(request);

        assertNotNull(response);
        assertEquals(Double.valueOf(5.5), response.getEffectiveRate());
        // M = 100000 + (100000 * 5.5 * 2 / 100) = 111000.00
        assertEquals(0, response.getMaturityAmount().compareTo(BigDecimal.valueOf(111000.00)));
    }

    @Test
    void testCategoryStackingExceedingCapClamped() {
        // Request: baseRate=5.0, categories=["SENIOR_CITIZEN", "SENIOR_CITIZEN", "EMPLOYEE"]
        // Additions: 1.0 + 1.0 + 0.5 = 2.5. Cap is 2.0.
        // Effective rate: 5.0 + 2.0 = 7.0%
        mockCatalogProduct("FD-CATEGORY-TEST", 5.0, 7.0,
                new RateVariationDTO("SENIOR_CITIZEN", 1.0),
                new RateVariationDTO("EMPLOYEE", 0.5));
        FdCalculationRequestDTO request = new FdCalculationRequestDTO(
                BigDecimal.valueOf(100000),
                new FdTermDTO(1, "years"),
                5.0,
                "FD-CATEGORY-TEST",
                List.of("SENIOR_CITIZEN", "SENIOR_CITIZEN", "EMPLOYEE"),
                "SIMPLE",
                null
        );

        FdCalculationResponseDTO response = fdCalculatorService.calculateMaturity(request);

        assertNotNull(response);
        assertEquals(Double.valueOf(7.0), response.getEffectiveRate());
        assertEquals(0, response.getMaturityAmount().compareTo(BigDecimal.valueOf(107000.00)));
    }

    @Test
    void testResolveRateFromProductClient() {
        // Mock productClient lookup
        ProductResponseDTO mockProduct = new ProductResponseDTO();
        mockProduct.setProductCode("FD123");
        mockProduct.setRateLimit(new RateLimitDTO(6.0, 8.0));
        
        RateVariationDTO v1 = new RateVariationDTO();
        v1.setCustomerCategory("SENIOR_CITIZEN");
        v1.setRateModifier(1.2); // Product overrides default 1.0 to 1.2
        mockProduct.setRateVariations(List.of(v1));

        Mockito.when(productClient.getProduct("FD123")).thenReturn(mockProduct);

        FdCalculationRequestDTO request = new FdCalculationRequestDTO(
                BigDecimal.valueOf(100000),
                new FdTermDTO(12, "months"),
                null,
                "FD123",
                List.of("SENIOR_CITIZEN"),
                "SIMPLE",
                null
        );

        FdCalculationResponseDTO response = fdCalculatorService.calculateMaturity(request);

        assertNotNull(response);
        assertEquals(Double.valueOf(7.2), response.getEffectiveRate()); // 6.0 + 1.2
        assertEquals(0, response.getMaturityAmount().compareTo(BigDecimal.valueOf(107200.00)));
    }

    private void mockCatalogProduct(String code, double minRate, double maxRate,
                                    RateVariationDTO... variations) {
        ProductResponseDTO product = new ProductResponseDTO();
        product.setProductCode(code);
        product.setRateLimit(new RateLimitDTO(minRate, maxRate));
        product.setRateVariations(List.of(variations));
        Mockito.when(productClient.getProduct(code)).thenReturn(product);
    }

    @Test
    void testInvalidPrincipalException() {
        FdCalculationRequestDTO request = new FdCalculationRequestDTO(
                BigDecimal.ZERO,
                new FdTermDTO(12, "months"),
                6.5,
                null,
                List.of(),
                "SIMPLE",
                null
        );

        assertThrows(InvalidCalculationInputException.class, () -> {
            fdCalculatorService.calculateMaturity(request);
        });
    }

    @Test
    void testUnknownCategoryException() {
        mockCatalogProduct("FD-UNKNOWN-CATEGORY-TEST", 6.0, 8.0,
                new RateVariationDTO("SENIOR_CITIZEN", 1.0));
        FdCalculationRequestDTO request = new FdCalculationRequestDTO(
                BigDecimal.valueOf(100000),
                new FdTermDTO(12, "months"),
                6.5,
                "FD-UNKNOWN-CATEGORY-TEST",
                List.of("INVALID_CATEGORY_XYZ"),
                "SIMPLE",
                null
        );

        assertThrows(UnknownCategoryException.class, () -> {
            fdCalculatorService.calculateMaturity(request);
        });
    }
}
