package com.bank.calculator.exception;

/** Thrown when the submitted term is outside the product's allowed range. */
public class InvalidTermException extends FdCalculatorException {
    public InvalidTermException(String message) {
        super("INVALID_TERM", message);
    }
}
