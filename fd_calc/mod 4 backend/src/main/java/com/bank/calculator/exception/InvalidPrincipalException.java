package com.bank.calculator.exception;

/**
 * Thrown when the submitted principal amount is outside the product's allowed min/max range.
 */
public class InvalidPrincipalException extends FdCalculatorException {

    public InvalidPrincipalException(String message) {
        super("INVALID_PRINCIPAL", message);
    }
}
