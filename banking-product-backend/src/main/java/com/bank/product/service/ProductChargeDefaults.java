package com.bank.product.service;

import com.bank.product.entity.Product;
import com.bank.product.entity.ProductCharge;

import java.util.ArrayList;
import java.util.Locale;
import java.util.Set;

/** Defaults shared by product creation and startup catalog reconciliation. */
public final class ProductChargeDefaults {
    public static final double FD_TRANSACTION_FEE = 100.0;

    private static final Set<String> PROCESSING_FEE_TYPES = Set.of(
            "PROCESSING_FEE", "TRANSACTION_FEE", "DEPOSIT_FEE", "ACCOUNT_OPENING_FEE", "APPLICATION_FEE");

    private ProductChargeDefaults() {}

    /** Adds the standard flat FD application fee only when no equivalent fee exists. */
    public static boolean ensureFdTransactionFee(Product product) {
        if (product == null || !"FD".equalsIgnoreCase(product.getProductType())) return false;

        var charges = product.getCharges();
        if (charges == null) {
            charges = new ArrayList<>();
            product.setCharges(charges);
        }

        boolean alreadyConfigured = charges.stream()
                .map(ProductCharge::getChargeType)
                .filter(type -> type != null)
                .map(type -> type.trim().toUpperCase(Locale.ROOT).replace(' ', '_'))
                .anyMatch(PROCESSING_FEE_TYPES::contains);
        if (alreadyConfigured) return false;

        charges.add(ProductCharge.builder()
                .chargeType("PROCESSING_FEE")
                .chargeValue(FD_TRANSACTION_FEE)
                .chargeUnit("flat")
                .feeType("ONE_TIME")
                .build());
        return true;
    }
}
