package com.bank.calculator.model.enums;

/**
 * Stable internal representation of recognised customer categories.
 * Incoming string values from the Customer Service are normalised to this enum
 * before any bonus logic is applied.  Unknown strings are silently ignored.
 */
public enum CustomerCategory {
    SENIOR_CITIZEN,
    EMPLOYEE,
    PREMIUM
}
