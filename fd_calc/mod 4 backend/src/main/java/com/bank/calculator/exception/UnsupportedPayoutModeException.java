package com.bank.calculator.exception;

/** Thrown when PERIODIC payout mode is requested for a product that does not support it. */
public class UnsupportedPayoutModeException extends FdCalculatorException {
    public UnsupportedPayoutModeException(String productCode) {
        super("UNSUPPORTED_PAYOUT_MODE",
              "Product " + productCode + " does not support PERIODIC payout mode.");
    }
}
