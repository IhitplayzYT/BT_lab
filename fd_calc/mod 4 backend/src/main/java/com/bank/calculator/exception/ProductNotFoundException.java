package com.bank.calculator.exception;

/** Thrown when the requested FD product is not found in the Product Service. */
public class ProductNotFoundException extends FdCalculatorException {
    public ProductNotFoundException(String productCode) {
        super("PRODUCT_NOT_FOUND", "FD product not found: " + productCode);
    }
}
