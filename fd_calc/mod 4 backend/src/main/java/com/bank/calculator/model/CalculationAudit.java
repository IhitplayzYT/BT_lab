package com.bank.calculator.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.Transient;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PrePersist;
import org.springframework.data.domain.Persistable;

import java.util.Objects;

/**
 * JPA entity for recording a simulation-only FD calculation audit trail.
 *
 * <p><strong>This table records calculation simulations only.</strong>
 * It does NOT represent a real FD account, a real deposit, or any financial
 * transaction. No money is moved based on this record.
 *
 * <p>Table: {@code fd_calculation_audit}
 */
@Entity
@Table(name = "fd_calculation_audit")
public class CalculationAudit implements Persistable<String> {

    @Transient
    private boolean isNewRecord = true;

    /** Primary key - UUID with CALC- prefix, e.g. CALC-550e8400-e29b-41d4-a716-446655440000. */
    @Id
    @Column(name = "id", nullable = false, unique = true, length = 50)
    private String id;

    /** Calculation identifier, e.g. CALC-20260911-0001 (business key). */
    @Column(name = "calculation_id", length = 30)
    private String calculationId;

    public void setId(String id) {
        this.id = id;
    }

    /** Persistent globally unique audit record identifier. */
    @Column(name = "uuid", nullable = false, unique = true, length = 36)
    private String uuid;

    /** Username from the verified JWT claim. */
    @Column(name = "customer_id", nullable = false, length = 50)
    private String customerId;

    @Column(name = "product_code", nullable = false, length = 20)
    private String productCode;

    /** Principal in INR, scale 2. */
    @Column(name = "principal", nullable = false, precision = 18, scale = 2)
    private BigDecimal principal;

    /** Term normalised to months. */
    @Column(name = "term_months", nullable = false)
    private int termMonths;

    /** Product base rate (%), scale 2. */
    @Column(name = "base_rate", nullable = false, precision = 6, scale = 2)
    private BigDecimal baseRate;

    /** Effective rate after category bonuses and caps (%), scale 2. */
    @Column(name = "effective_rate", nullable = false, precision = 6, scale = 2)
    private BigDecimal effectiveRate;

    /** SIMPLE or COMPOUND. */
    @Column(name = "interest_type", nullable = false, length = 10)
    private String interestType;

    /** Interest earned (INR), scale 2. */
    @Column(name = "interest_earned", nullable = false, precision = 18, scale = 2)
    private BigDecimal interestEarned;

    /** Maturity amount (INR), scale 2. */
    @Column(name = "maturity_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal maturityAmount;

    /** Estimated maturity date. */
    @Column(name = "estimated_maturity_date")
    private LocalDate estimatedMaturityDate;

    /** Timestamp when this audit record was created. */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "ldbid")
    private Integer ldbid;

    @Column(name = "ooo_acpt_ts_utc_ofst", length = 6)
    private String oooAcptTsUtcOfst;

    @Column(name = "ooo_user_id", length = 32)
    private String oooUserId;

    @Column(name = "ooo_ws_id", length = 32)
    private String oooWsId;

    @Column(name = "rule_system_id", length = 32)
    private String ruleSystemId;

    @Column(name = "ooo_acpt_ts")
    private Instant oooAcptTs;

    @Column(name = "ooo_host_ts")
    private Instant oooHostTs;

    @Column(name = "ooo_local_ts")
    private Instant oooLocalTs;

    public CalculationAudit() {
    }

    public CalculationAudit(String id, String calculationId, String uuid, String customerId, String productCode,
                            BigDecimal principal, int termMonths, BigDecimal baseRate,
                            BigDecimal effectiveRate, String interestType, BigDecimal interestEarned,
                            BigDecimal maturityAmount, LocalDate estimatedMaturityDate, Instant createdAt) {
        this.id = id;
        this.calculationId = calculationId;
        this.uuid = uuid;
        this.customerId = customerId;
        this.productCode = productCode;
        this.principal = principal;
        this.termMonths = termMonths;
        this.baseRate = baseRate;
        this.effectiveRate = effectiveRate;
        this.interestType = interestType;
        this.interestEarned = interestEarned;
        this.maturityAmount = maturityAmount;
        this.estimatedMaturityDate = estimatedMaturityDate;
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public String getCalculationId() {
        return calculationId;
    }

    public void setCalculationId(String calculationId) {
        this.calculationId = calculationId;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getProductCode() {
        return productCode;
    }

    public void setProductCode(String productCode) {
        this.productCode = productCode;
    }

    public BigDecimal getPrincipal() {
        return principal;
    }

    public void setPrincipal(BigDecimal principal) {
        this.principal = principal;
    }

    public int getTermMonths() {
        return termMonths;
    }

    public void setTermMonths(int termMonths) {
        this.termMonths = termMonths;
    }

    public BigDecimal getBaseRate() {
        return baseRate;
    }

    public void setBaseRate(BigDecimal baseRate) {
        this.baseRate = baseRate;
    }

    public BigDecimal getEffectiveRate() {
        return effectiveRate;
    }

    public void setEffectiveRate(BigDecimal effectiveRate) {
        this.effectiveRate = effectiveRate;
    }

    public String getInterestType() {
        return interestType;
    }

    public void setInterestType(String interestType) {
        this.interestType = interestType;
    }

    public BigDecimal getInterestEarned() {
        return interestEarned;
    }

    public void setInterestEarned(BigDecimal interestEarned) {
        this.interestEarned = interestEarned;
    }

    public BigDecimal getMaturityAmount() {
        return maturityAmount;
    }

    public void setMaturityAmount(BigDecimal maturityAmount) {
        this.maturityAmount = maturityAmount;
    }

    public LocalDate getEstimatedMaturityDate() {
        return estimatedMaturityDate;
    }

    public void setEstimatedMaturityDate(LocalDate estimatedMaturityDate) {
        this.estimatedMaturityDate = estimatedMaturityDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getLdbid() {
        return ldbid;
    }

    public void setLdbid(Integer ldbid) {
        this.ldbid = ldbid;
    }

    public String getOooAcptTsUtcOfst() {
        return oooAcptTsUtcOfst;
    }

    public void setOooAcptTsUtcOfst(String oooAcptTsUtcOfst) {
        this.oooAcptTsUtcOfst = oooAcptTsUtcOfst;
    }

    public String getOooUserId() {
        return oooUserId;
    }

    public void setOooUserId(String oooUserId) {
        this.oooUserId = oooUserId;
    }

    public String getOooWsId() {
        return oooWsId;
    }

    public void setOooWsId(String oooWsId) {
        this.oooWsId = oooWsId;
    }

    public String getRuleSystemId() {
        return ruleSystemId;
    }

    public void setRuleSystemId(String ruleSystemId) {
        this.ruleSystemId = ruleSystemId;
    }

    public Instant getOooAcptTs() {
        return oooAcptTs;
    }

    public void setOooAcptTs(Instant oooAcptTs) {
        this.oooAcptTs = oooAcptTs;
    }

    public Instant getOooHostTs() {
        return oooHostTs;
    }

    public void setOooHostTs(Instant oooHostTs) {
        this.oooHostTs = oooHostTs;
    }

    public Instant getOooLocalTs() {
        return oooLocalTs;
    }

    public void setOooLocalTs(Instant oooLocalTs) {
        this.oooLocalTs = oooLocalTs;
    }

    @Override
    public String getId() {
        return id;
    }

    @Override
    public boolean isNew() {
        return isNewRecord;
    }

    @PostLoad
    void markNotNew() {
        this.isNewRecord = false;
        if (this.id == null) {
            this.id = "CALC-" + java.util.UUID.randomUUID().toString();
        }
    }

    @PrePersist
    protected void onPrePersist() {
        String currentUser = getCurrentAuditor();
        if (this.uuid == null) this.uuid = java.util.UUID.randomUUID().toString();
        if (this.oooUserId == null) this.oooUserId = truncate(currentUser, 32);
        if (this.oooWsId == null) this.oooWsId = "DEFAULT";
        if (this.oooLocalTs == null) this.oooLocalTs = java.time.Instant.now();
        if (this.oooHostTs == null) this.oooHostTs = java.time.Instant.now();
        if (this.ruleSystemId == null) this.ruleSystemId = "RULES_SYS";
        if (this.ldbid == null) this.ldbid = 1;
        if (this.oooAcptTs == null) this.oooAcptTs = java.time.Instant.now();
        if (this.oooAcptTsUtcOfst == null) this.oooAcptTsUtcOfst = "+05:30";
        if (this.createdAt == null) this.createdAt = java.time.Instant.now();
    }

    @PreUpdate
    protected void onPreUpdate() {
        this.updatedAt = java.time.Instant.now();
    }

    private String getCurrentAuditor() {
        // In a real implementation, this would get the current user from SecurityContext
        // For now, return a default value
        return "SYSTEM";
    }

    private String truncate(String value, int maxLength) {
        if (value == null) return null;
        return value.length() > maxLength ? value.substring(0, maxLength) : value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CalculationAudit that)) return false;
        return uuid != null && Objects.equals(uuid, that.uuid);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    public static class Builder {
        private String id;
        private String calculationId;
        private String uuid;
        private String customerId;
        private String productCode;
        private BigDecimal principal;
        private int termMonths;
        private BigDecimal baseRate;
        private BigDecimal effectiveRate;
        private String interestType;
        private BigDecimal interestEarned;
        private BigDecimal maturityAmount;
        private LocalDate estimatedMaturityDate;
        private Instant createdAt;
        private Instant updatedAt;
        private Integer ldbid;
        private String oooAcptTsUtcOfst;
        private String oooUserId;
        private String oooWsId;
        private String ruleSystemId;
        private Instant oooAcptTs;
        private Instant oooHostTs;
        private Instant oooLocalTs;

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder calculationId(String calculationId) {
            this.calculationId = calculationId;
            return this;
        }

        public Builder uuid(String uuid) {
            this.uuid = uuid;
            return this;
        }

        public Builder customerId(String customerId) {
            this.customerId = customerId;
            return this;
        }

        public Builder productCode(String productCode) {
            this.productCode = productCode;
            return this;
        }

        public Builder principal(BigDecimal principal) {
            this.principal = principal;
            return this;
        }

        public Builder termMonths(int termMonths) {
            this.termMonths = termMonths;
            return this;
        }

        public Builder baseRate(BigDecimal baseRate) {
            this.baseRate = baseRate;
            return this;
        }

        public Builder effectiveRate(BigDecimal effectiveRate) {
            this.effectiveRate = effectiveRate;
            return this;
        }

        public Builder interestType(String interestType) {
            this.interestType = interestType;
            return this;
        }

        public Builder interestEarned(BigDecimal interestEarned) {
            this.interestEarned = interestEarned;
            return this;
        }

        public Builder maturityAmount(BigDecimal maturityAmount) {
            this.maturityAmount = maturityAmount;
            return this;
        }

        public Builder estimatedMaturityDate(LocalDate estimatedMaturityDate) {
            this.estimatedMaturityDate = estimatedMaturityDate;
            return this;
        }

        public Builder createdAt(Instant createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(Instant updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Builder ldbid(Integer ldbid) {
            this.ldbid = ldbid;
            return this;
        }

        public Builder oooAcptTsUtcOfst(String oooAcptTsUtcOfst) {
            this.oooAcptTsUtcOfst = oooAcptTsUtcOfst;
            return this;
        }

        public Builder oooUserId(String oooUserId) {
            this.oooUserId = oooUserId;
            return this;
        }

        public Builder oooWsId(String oooWsId) {
            this.oooWsId = oooWsId;
            return this;
        }

        public Builder ruleSystemId(String ruleSystemId) {
            this.ruleSystemId = ruleSystemId;
            return this;
        }

        public Builder oooAcptTs(Instant oooAcptTs) {
            this.oooAcptTs = oooAcptTs;
            return this;
        }

        public Builder oooHostTs(Instant oooHostTs) {
            this.oooHostTs = oooHostTs;
            return this;
        }

        public Builder oooLocalTs(Instant oooLocalTs) {
            this.oooLocalTs = oooLocalTs;
            return this;
        }

        public CalculationAudit build() {
            CalculationAudit audit = new CalculationAudit(id, calculationId, uuid, customerId, productCode, principal,
                    termMonths, baseRate, effectiveRate, interestType, interestEarned,
                    maturityAmount, estimatedMaturityDate, createdAt);
            audit.setUpdatedAt(updatedAt);
            audit.setLdbid(ldbid);
            audit.setOooAcptTsUtcOfst(oooAcptTsUtcOfst);
            audit.setOooUserId(oooUserId);
            audit.setOooWsId(oooWsId);
            audit.setRuleSystemId(ruleSystemId);
            audit.setOooAcptTs(oooAcptTs);
            audit.setOooHostTs(oooHostTs);
            audit.setOooLocalTs(oooLocalTs);
            return audit;
        }
    }
}
