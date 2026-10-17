package com.bank.fdcalculator.exception;

public class InvalidCalculationInputException extends RuntimeException {
    public InvalidCalculationInputException(String message) {
        super(message);
    }
}
