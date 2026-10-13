package com.bank.calculator.service;

import com.bank.calculator.model.CalculationAudit;
import com.bank.calculator.repository.CalculationAuditRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Asynchronous audit persistence service with read-after-write consistency.
 *
 * <p>Saves calculation audit records in a non-blocking manner so that
 * audit storage failures do not delay the calculation response.
 *
 * <p>In-memory lookup cache ensures immediate retrieval by the same user
 * (e.g. GET /calculations/{id} or /export) succeeds even before the async DB
 * transaction commits.
 */
@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final CalculationAuditRepository repository;
    private final Map<String, CalculationAudit> recentByCalcId = new ConcurrentHashMap<>();
    private final Map<String, CalculationAudit> recentByUuid = new ConcurrentHashMap<>();

    public AuditService(CalculationAuditRepository repository) {
        this.repository = repository;
    }

    /**
     * Persists a calculation audit record asynchronously.
     * The calling thread returns immediately; this runs in a Spring async thread pool.
     *
     * @param audit         the audit record to persist
     * @param correlationId the request correlation ID for log traceability
     */
    @Async
    public void saveAsync(CalculationAudit audit, String correlationId) {
        if (audit != null) {
            if (audit.getCalculationId() != null) {
                recentByCalcId.put(audit.getCalculationId(), audit);
            }
            if (audit.getUuid() != null) {
                recentByUuid.put(audit.getUuid(), audit);
            }
        }
        try {
            repository.save(audit);
            log.debug("[{}] Audit record saved: {}", correlationId, audit != null ? audit.getCalculationId() : null);
        } catch (Exception ex) {
            // WARNING: failure logged with correlation ID — never silently swallowed
            log.warn("[{}] Audit storage failed for calculationId='{}'. " +
                     "The calculation result was already returned to the client. Error: {}",
                     correlationId, audit != null ? audit.getCalculationId() : null, ex.getMessage());
        }
    }

    /**
     * Looks up recent audit by calculationId and owning customerId from in-memory cache.
     */
    public Optional<CalculationAudit> findRecentByCalculationIdAndCustomerId(String calculationId, String customerId) {
        CalculationAudit audit = recentByCalcId.get(calculationId);
        if (audit != null && customerId != null && customerId.equals(audit.getCustomerId())) {
            return Optional.of(audit);
        }
        return Optional.empty();
    }

    /**
     * Looks up recent audit by persistent UUID and owning customerId from in-memory cache.
     */
    public Optional<CalculationAudit> findRecentByUuidAndCustomerId(String uuid, String customerId) {
        CalculationAudit audit = recentByUuid.get(uuid);
        if (audit != null && customerId != null && customerId.equals(audit.getCustomerId())) {
            return Optional.of(audit);
        }
        return Optional.empty();
    }
}
