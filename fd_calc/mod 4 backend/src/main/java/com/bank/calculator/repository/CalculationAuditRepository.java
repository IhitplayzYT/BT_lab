package com.bank.calculator.repository;

import com.bank.calculator.model.CalculationAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for simulation audit records.
 * Provides ownership-based lookup to prevent cross-customer data access.
 */
@Repository
public interface CalculationAuditRepository extends JpaRepository<CalculationAudit, String> {

    /**
     * Finds a calculation by ID and owner (customerId).
     * Used to enforce that a customer can only retrieve their own calculations.
     *
     * @param calculationId the calculation identifier
     * @param customerId    the authenticated customer's ID
     * @return the audit record if found and owned by the customer
     */
    Optional<CalculationAudit> findByCalculationIdAndCustomerId(
            String calculationId, String customerId);

    /**
     * Finds a calculation by persistent UUID and owner (customerId).
     *
     * @param uuid       the persistent UUID
     * @param customerId the authenticated customer's ID
     * @return the audit record if found and owned by the customer
     */
    Optional<CalculationAudit> findByUuidAndCustomerId(String uuid, String customerId);

    /**
     * Returns the maximum calculation ID for a given date string (e.g. "20261013").
     * Used by CalculationIdGenerator to resume sequence across server restarts.
     *
     * @param dateStr the date in YYYYMMDD format
     * @return the maximum calculation ID if any exist for that date
     */
    @org.springframework.data.jpa.repository.Query("SELECT MAX(a.calculationId) FROM CalculationAudit a WHERE a.calculationId LIKE CONCAT('CALC-', :dateStr, '-%')")
    Optional<String> findMaxCalculationIdForDate(@org.springframework.data.repository.query.Param("dateStr") String dateStr);
}
