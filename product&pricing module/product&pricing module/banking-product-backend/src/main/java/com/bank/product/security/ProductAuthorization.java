package com.bank.product.security;

/**
 * Single place that decides who may do what on the Product API (lab manual L9).
 * Used in @PreAuthorize on ProductController. Change a rule here, nowhere else.
 */
public final class ProductAuthorization {

    private ProductAuthorization() {
    }

    /** Query endpoints: search, get, active, defaults, validate, rate. */
    public static final String READ = "hasAnyRole('BANK_OFFICER','ADMIN')";

    /** Create (POST) and update (PUT). */
    public static final String WRITE = "hasAnyRole('BANK_OFFICER','ADMIN')";

    /**
     * Retire (DELETE). BANK_OFFICER and ADMIN (confirmed). To make it ADMIN-only again, change this one line to
     * "hasRole('ADMIN')". Note PUT can also set status RETIRED, so tightening this alone does not restrict retiring.
     */
    public static final String RETIRE = WRITE;
}
