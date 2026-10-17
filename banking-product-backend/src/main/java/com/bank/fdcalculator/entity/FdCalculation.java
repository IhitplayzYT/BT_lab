package com.bank.fdcalculator.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "fd_calculations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FdCalculation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "calculation_id")
    private Long id;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal principal;

    @Column(name = "term_value", nullable = false)
    private Integer termValue;

    @Column(name = "term_unit", nullable = false)
    private String termUnit;

    @Column(name = "product_code")
    private String productCode;

    @Column(name = "effective_rate", nullable = false)
    private Double effectiveRate;

    @Column(name = "interest_type", nullable = false)
    private String interestType;

    @Column(name = "maturity_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal maturityAmount;

    @Column(name = "interest_earned", nullable = false, precision = 15, scale = 2)
    private BigDecimal interestEarned;

    @Column(name = "currency", nullable = false)
    private String currency;

    @Column(name = "calculation_date", nullable = false)
    private LocalDateTime calculationDate;

    @Column(name = "ooo_user_id", nullable = false, length = 32)
    private String oooUserId;

    @Column(name = "ooo_ws_id", nullable = false, length = 32)
    private String oooWsId;

    @Column(name = "ooo_local_ts", nullable = false)
    private LocalDateTime oooLocalTs;

    @Column(name = "ooo_host_ts", nullable = false)
    private LocalDateTime oooHostTs;

    @Column(name = "rule_system_id", nullable = false, length = 32)
    private String ruleSystemId;

    @Column(name = "ldbid", nullable = false)
    private Integer ldbid;

    @Column(name = "ooo_acpt_ts", nullable = false)
    private LocalDateTime oooAcptTs;

    @Column(name = "ooo_acpt_ts_utc_ofst", nullable = false, length = 6)
    private String oooAcptTsUtcOfst;

    @Column(name = "uuid", length = 36)
    private String uuid;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_converted")
    private Boolean isConverted;

    @Column(name = "conversion_rate")
    private Double conversionRate;

    @PrePersist
    protected void onCreate() {
        calculationDate = LocalDateTime.now();
        if (this.oooUserId == null) this.oooUserId = "SYSTEM";
        if (this.oooWsId == null) this.oooWsId = "DEFAULT";
        if (this.oooLocalTs == null) this.oooLocalTs = LocalDateTime.now();
        if (this.oooHostTs == null) this.oooHostTs = LocalDateTime.now();
        if (this.ruleSystemId == null) this.ruleSystemId = "RULES_SYS";
        if (this.ldbid == null) this.ldbid = 1;
        if (this.oooAcptTs == null) this.oooAcptTs = LocalDateTime.now();
        if (this.oooAcptTsUtcOfst == null) this.oooAcptTsUtcOfst = "+05:30";
        if (this.uuid == null) this.uuid = java.util.UUID.randomUUID().toString();
        if (this.isConverted == null) this.isConverted = false;
    }
}
