package com.bank.product.exception;

public class InvalidProductRuleException extends RuntimeException {
    public InvalidProductRuleException(String message) {
        super(message);
    }
}
