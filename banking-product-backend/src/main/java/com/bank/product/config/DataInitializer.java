package com.bank.product.config;

import com.bank.product.entity.*;
import com.bank.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (productRepository.count() == 0) {
            log.info("Initializing FD products in database...");
            initializeFDProducts();
        } else {
            log.info("Products already exist in database. Skipping initialization.");
        }
    }

    private void initializeFDProducts() {
        List<Product> products = new ArrayList<>();

        // Product 1: Standard FD - Short Term
        products.add(createProduct(
            "FD_STD_SHORT",
            "Standard FD - Short Term",
            "FD",
            "INR",
            6.0,
            7.0,
            6,
            24,
            10000.0,
            500000.0
        ));

        // Product 2: Standard FD - Medium Term
        products.add(createProduct(
            "FD_STD_MED",
            "Standard FD - Medium Term",
            "FD",
            "INR",
            6.5,
            7.5,
            24,
            60,
            10000.0,
            1000000.0
        ));

        // Product 3: Standard FD - Long Term
        products.add(createProduct(
            "FD_STD_LONG",
            "Standard FD - Long Term",
            "FD",
            "INR",
            7.0,
            8.0,
            60,
            120,
            10000.0,
            10000000.0
        ));

        // Product 4: Senior Citizen FD
        products.add(createProduct(
            "FD_SENIOR",
            "Senior Citizen Special FD",
            "FD",
            "INR",
            7.0,
            8.5,
            12,
            120,
            5000.0,
            5000000.0,
            60
        ));

        // Product 5: Tax Saver FD
        products.add(createProduct(
            "FD_TAX_SAVER",
            "Tax Saver FD (5-Year Lock-in)",
            "FD",
            "INR",
            7.0,
            7.5,
            60,
            60,
            10000.0,
            150000.0
        ));

        // Product 6: NRI FD - NRE
        products.add(createProduct(
            "FD_NRE",
            "NRE Fixed Deposit",
            "FD",
            "USD",
            4.0,
            5.0,
            12,
            60,
            1000.0,
            100000.0
        ));

        // Product 7: NRI FD - NRO
        products.add(createProduct(
            "FD_NRO",
            "NRO Fixed Deposit",
            "FD",
            "INR",
            6.0,
            7.0,
            12,
            36,
            10000.0,
            1000000.0
        ));

        // Product 8: Corporate FD
        products.add(createProduct(
            "FD_CORP",
            "Corporate Fixed Deposit",
            "FD",
            "INR",
            7.5,
            8.5,
            12,
            36,
            100000.0,
            100000000.0
        ));

        // Product 9: Flexi FD
        products.add(createProduct(
            "FD_FLEXI",
            "Flexible FD with Partial Withdrawal",
            "FD",
            "INR",
            6.5,
            7.5,
            12,
            48,
            25000.0,
            5000000.0
        ));

        // Product 10: Cumulative FD
        products.add(createProduct(
            "FD_CUMULATIVE",
            "Cumulative Interest FD",
            "FD",
            "INR",
            7.0,
            8.0,
            24,
            120,
            10000.0,
            10000000.0
        ));

        productRepository.saveAll(products);
        log.info("Successfully initialized {} FD products", products.size());
    }

    private Product createProduct(String code, String name, String type, String currency,
                                   double minRate, double maxRate, int minTerm, int maxTerm,
                                   double minDeposit, double maxDeposit) {
        return createProduct(code, name, type, currency, minRate, maxRate, minTerm, maxTerm,
                            minDeposit, maxDeposit, null);
    }

    private Product createProduct(String code, String name, String type, String currency,
                                   double minRate, double maxRate, int minTerm, int maxTerm,
                                   double minDeposit, double maxDeposit, Integer minAge) {
        Product product = Product.builder()
                .productCode(code)
                .productName(name)
                .productType(type)
                .currency(currency)
                .effectiveDate(LocalDate.now())
                .isActive(true)
                .status(ProductStatus.ACTIVE)
                .interestType("CREDIT")
                .minAge(minAge)
                .minDeposit(minDeposit)
                .maxDeposit(maxDeposit)
                .minWithdrawal(null)
                .maxWithdrawal(null)
                .allowedTransactionTypes("DEPOSIT,WITHDRAWAL")
                .balanceTypes("PRINCIPAL,INTEREST")
                .build();

        // Add business rule for term and rate limits
        ProductBusinessRule businessRule = ProductBusinessRule.builder()
                .termLimitMin(minTerm)
                .termLimitMax(maxTerm)
                .rateLimitMin(minRate)
                .rateLimitMax(maxRate)
                .transactionType("DEPOSIT")
                .build();

        product.setBusinessRules(new ArrayList<>());
        product.getBusinessRules().add(businessRule);

        // Add rate variations
        List<RateVariation> rateVariations = new ArrayList<>();
        rateVariations.add(RateVariation.builder()
                .customerCategory("GENERAL")
                .rateModifier(0.0)
                .build());
        rateVariations.add(RateVariation.builder()
                .customerCategory("SENIOR_CITIZEN")
                .rateModifier(0.5)
                .build());
        rateVariations.add(RateVariation.builder()
                .customerCategory("EMPLOYEE")
                .rateModifier(0.25)
                .build());
        product.setRateVariations(rateVariations);

        // Add charges
        List<ProductCharge> charges = new ArrayList<>();
        charges.add(ProductCharge.builder()
                .chargeType("PREMATURE_WITHDRAWAL")
                .chargeValue(1.0)
                .chargeUnit("percentage")
                .feeType("EVENT_BASED")
                .build());
        product.setCharges(charges);

        // Add allowed roles
        List<ProductRole> roles = new ArrayList<>();
        roles.add(ProductRole.builder()
                .roleType("OWNER")
                .isMandatory(true)
                .build());
        roles.add(ProductRole.builder()
                .roleType("NOMINEE")
                .isMandatory(false)
                .build());
        product.setAllowedRoles(roles);

        return product;
    }
}
