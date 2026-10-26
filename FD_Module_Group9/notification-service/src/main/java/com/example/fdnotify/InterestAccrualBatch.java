package com.example.fdnotify;

import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Accumulates InterestAccrued events by customer to send batched emails
 * instead of spamming with individual emails for each FD.
 */
@Component
public class InterestAccrualBatch {
    private final Map<String, List<AccrualEntry>> customerAccruals = new HashMap<>();

    public record AccrualEntry(
        String eventId,
        String fdAccountNo,
        String businessDate,
        String interestAccrued,
        String outstandingInterest,
        String currency
    ) {}

    /**
     * Add an interest accrual entry for a customer
     */
    public void add(String customerId, AccrualEntry entry) {
        customerAccruals.computeIfAbsent(customerId, k -> new ArrayList<>()).add(entry);
    }

    /**
     * Get all pending accruals for a customer
     */
    public List<AccrualEntry> getAccruals(String customerId) {
        return customerAccruals.getOrDefault(customerId, new ArrayList<>());
    }

    /**
     * Remove all accruals for a customer (after sending batch email)
     */
    public void clear(String customerId) {
        customerAccruals.remove(customerId);
    }

    /**
     * Get all customers with pending accruals
     */
    public List<String> getCustomersWithPendingAccruals() {
        return new ArrayList<>(customerAccruals.keySet());
    }

    /**
     * Check if a customer has pending accruals
     */
    public boolean hasPendingAccruals(String customerId) {
        return customerAccruals.containsKey(customerId) && !customerAccruals.get(customerId).isEmpty();
    }

    /**
     * Get total number of pending entries across all customers
     */
    public int getTotalPendingCount() {
        return customerAccruals.values().stream().mapToInt(List::size).sum();
    }
}
