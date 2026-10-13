package com.bank.calculator.model.enums;

/**
 * How the customer wishes to receive interest from the FD.
 * CUMULATIVE  – interest is reinvested; full maturity amount returned at end.
 * PERIODIC    – estimated periodic payout (only when product supports it).
 *               The Calculator never initiates a real payout.
 */
public enum PayoutMode {
    CUMULATIVE,
    PERIODIC
}
