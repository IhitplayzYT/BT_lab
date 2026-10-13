package com.bank.calculator.util;

import com.bank.calculator.repository.CalculationAuditRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Generates deterministic, thread-safe calculation IDs of the form:
 * <pre>CALC-YYYYMMDD-NNNN</pre>
 * The sequence resets each day and resumes from the highest persisted
 * ID in the database across application restarts to prevent audit overwriting.
 */
@Component
public class CalculationIdGenerator {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final CalculationAuditRepository auditRepository;
    private volatile String lastDate = "";
    private final AtomicInteger sequence = new AtomicInteger(0);

    public CalculationIdGenerator() {
        this.auditRepository = null;
    }

    @Autowired
    public CalculationIdGenerator(@Autowired(required = false) CalculationAuditRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    /**
     * Returns the next calculation ID, e.g. {@code CALC-20260911-0001}.
     */
    public synchronized String next() {
        String today = LocalDate.now().format(DATE_FMT);
        if (!today.equals(lastDate)) {
            lastDate = today;
            int initialSeq = 0;
            if (auditRepository != null) {
                try {
                    Optional<String> maxId = auditRepository.findMaxCalculationIdForDate(today);
                    if (maxId.isPresent() && maxId.get() != null) {
                        String idStr = maxId.get();
                        String[] parts = idStr.split("-");
                        if (parts.length >= 3) {
                            initialSeq = Integer.parseInt(parts[2]);
                        }
                    }
                } catch (Exception ignored) {
                    // Fallback to 0 if database is unavailable during bootstrap
                }
            }
            sequence.set(initialSeq);
        }
        return String.format("CALC-%s-%04d", today, sequence.incrementAndGet());
    }
}
