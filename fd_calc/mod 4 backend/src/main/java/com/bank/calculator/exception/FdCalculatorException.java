package com.bank.calculator.exception;

/** Base class for all FD Calculator domain exceptions. */
public abstract class FdCalculatorException extends RuntimeException {

    private final String errorCode;

    protected FdCalculatorException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
