package com.example.fdnotify;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled task to flush batched interest accrual emails
 * Runs every 30 seconds to send consolidated emails for accrued interest
 * This allows batching of multiple accruals from the same operation (e.g., day forward)
 * while still sending emails promptly after accruals occur.
 */
@Component
public class AccrualBatchScheduler {
    private static final Logger log = LoggerFactory.getLogger(AccrualBatchScheduler.class);
    
    private final NotificationService notificationService;
    private final InterestAccrualBatch accrualBatch;

    public AccrualBatchScheduler(NotificationService notificationService, InterestAccrualBatch accrualBatch) {
        this.notificationService = notificationService;
        this.accrualBatch = accrualBatch;
    }

    /**
     * Flush all pending batched accruals every 30 seconds
     * This collects accruals that happen close together (e.g., from a day forward operation)
     * and sends them as a single email per customer.
     * Fixed rate: 30 seconds = 30000 ms
     */
    @Scheduled(fixedRate = 30000, initialDelay = 30000)
    public void flushBatchedAccruals() {
        int pendingCount = accrualBatch.getTotalPendingCount();
        if (pendingCount == 0) {
            return;
        }
        
        log.info("Flushing {} batched interest accrual emails", pendingCount);
        try {
            notificationService.flushAllBatchedAccruals();
            log.info("Successfully flushed {} batched interest accrual emails", pendingCount);
        } catch (Exception e) {
            log.error("Error flushing batched interest accruals", e);
        }
    }
}
