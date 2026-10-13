package com.bank.calculator.exception;

/** Thrown when a product exists but is not ACTIVE. */
public class InactiveProductException extends FdCalculatorException {
    public InactiveProductException(String productCode) {
        super("INACTIVE_PRODUCT", "FD product is not active: " + productCode);
    }
}
