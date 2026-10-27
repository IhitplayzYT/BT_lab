package com.example.fdnotify;

import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Accumulates InterestAccrued events by customer to send batched emails
 * instead of spamming with individual emails for each FD.
 * The Kafka listener adds while the scheduler flushes, so every list is only touched inside compute(),
 * which locks that customer's entry.
 */
@Component
public class InterestAccrualBatch {
    private final Map<String, List<AccrualEntry>> customerAccruals = new ConcurrentHashMap<>();

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
        customerAccruals.compute(customerId, (k, v) -> {
            List<AccrualEntry> list = v == null ? new ArrayList<>() : v;
            list.add(entry);
            return list;
        });
    }

    /**
     * Snapshot of the pending accruals for a customer
     */
    public List<AccrualEntry> getAccruals(String customerId) {
        List<AccrualEntry> snapshot = new ArrayList<>();
        customerAccruals.computeIfPresent(customerId, (k, v) -> {
            snapshot.addAll(v);
            return v;
        });
        return snapshot;
    }

    /**
     * Remove only the accruals that were sent; ones added during the send stay for the next flush
     */
    public void removeSent(String customerId, List<AccrualEntry> sent) {
        customerAccruals.computeIfPresent(customerId, (k, v) -> {
            v.removeAll(sent);
            return v.isEmpty() ? null : v;
        });
    }

    /**
     * Get all customers with pending accruals
     */
    public List<String> getCustomersWithPendingAccruals() {
        return new ArrayList<>(customerAccruals.keySet());
    }

    /**
     * Get total number of pending entries across all customers
     */
    public int getTotalPendingCount() {
        return customerAccruals.values().stream().mapToInt(List::size).sum();
    }
}
