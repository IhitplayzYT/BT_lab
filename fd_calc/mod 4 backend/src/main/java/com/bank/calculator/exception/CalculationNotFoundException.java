package com.bank.calculator.exception;

/** Thrown when a calculation audit record is not found or not owned by the requester. */
public class CalculationNotFoundException extends FdCalculatorException {
    public CalculationNotFoundException(String calculationId) {
        super("CALCULATION_NOT_FOUND",
              "Calculation not found or access denied: " + calculationId);
    }
}
