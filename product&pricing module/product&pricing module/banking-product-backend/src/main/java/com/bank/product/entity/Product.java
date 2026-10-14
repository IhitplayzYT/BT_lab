package com.bank.product.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"businessRules", "charges", "allowedRoles", "rateVariations"})
@EqualsAndHashCode(exclude = {"businessRules", "charges", "allowedRoles", "rateVariations"})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Integer productId;

    @Column(name = "id", nullable = false, unique = true, length = 50)
    private String id; // UUID for backward compatibility

    @Column(name = "product_code", unique = true, nullable = false, length = 50)
    private String productCode;

    @Column(name = "product_name", nullable = false, length = 100)
    private String productName;

    @Column(name = "product_type", nullable = false, length = 20)
    private String productType;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    @Column(name = "interest_type", length = 10)
    @Builder.Default
    private String interestType = "CREDIT";

    @Column(name = "min_age")
    private Integer minAge;

    @Column(name = "min_deposit", precision = 18, scale = 2)
    private java.math.BigDecimal minDeposit;

    @Column(name = "max_deposit", precision = 18, scale = 2)
    private java.math.BigDecimal maxDeposit;

    @Column(name = "min_withdrawal", precision = 18, scale = 2)
    private java.math.BigDecimal minWithdrawal;

    @Column(name = "max_withdrawal", precision = 18, scale = 2)
    private java.math.BigDecimal maxWithdrawal;

    @Column(name = "allowed_transaction_types", length = 255)
    private String allowedTransactionTypes;

    @Column(name = "balance_types", length = 255)
    private String balanceTypes;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    // nullable = false: Hibernate inserts the FK with the child row (schema.sql declares it NOT NULL)
    @JoinColumn(name = "product_id", nullable = false)
    @Builder.Default
    private List<ProductBusinessRule> businessRules = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    // nullable = false: Hibernate inserts the FK with the child row (schema.sql declares it NOT NULL)
    @JoinColumn(name = "product_id", nullable = false)
    @Builder.Default
    private List<ProductCharge> charges = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    // nullable = false: Hibernate inserts the FK with the child row (schema.sql declares it NOT NULL)
    @JoinColumn(name = "product_id", nullable = false)
    @Builder.Default
    private List<ProductRole> allowedRoles = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "product_rate_variations", joinColumns = @JoinColumn(name = "product_id"))
    @Builder.Default
    private List<RateVariation> rateVariations = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Audit columns (exact match to database schema specification)
    @Column(name = "ldbid", nullable = false)
    private Integer ldbid;

    @Column(name = "ooo_acpt_ts_utc_ofst", nullable = false, length = 6)
    private String oooAcptTsUtcOfst;

    @Column(name = "ooo_user_id", nullable = false, length = 32)
    private String oooUserId;

    @Column(name = "ooo_ws_id", nullable = false, length = 32)
    private String oooWsId;

    @Column(name = "rule_system_id", nullable = false, length = 32)
    private String ruleSystemId;

    @Column(name = "uuid", length = 36)
    private String uuid;

    @Column(name = "ooo_acpt_ts", nullable = false)
    private LocalDateTime oooAcptTs;

    @Column(name = "ooo_host_ts", nullable = false)
    private LocalDateTime oooHostTs;

    @Column(name = "ooo_local_ts", nullable = false)
    private LocalDateTime oooLocalTs;

    @Transient
    private String updatedBy;

    public String getUpdatedBy() {
        return updatedBy != null ? updatedBy : oooUserId;
    }

    public ProductStatus getStatus() {
        if (status != null) {
            return status;
        }
        return (isActive != null && isActive) ? ProductStatus.ACTIVE : ProductStatus.INACTIVE;
    }

    public void setStatus(ProductStatus status) {
        this.status = status;
        this.isActive = (status == ProductStatus.ACTIVE);
    }

    public java.math.BigDecimal getMinimumInterest() {
        if (businessRules != null && !businessRules.isEmpty()) {
            return businessRules.get(0).getRateLimitMin();
        }
        return null;
    }

    public java.math.BigDecimal getMaximumInterest() {
        if (businessRules != null && !businessRules.isEmpty()) {
            return businessRules.get(0).getRateLimitMax();
        }
        return null;
    }

    public void setMinimumInterest(java.math.BigDecimal value) {
        if (businessRules == null) {
            businessRules = new ArrayList<>();
        }
        if (businessRules.isEmpty()) {
            businessRules.add(ProductBusinessRule.builder()
                    .termLimitMin(0)
                    .termLimitMax(0)
                    .rateLimitMin(value != null ? value : java.math.BigDecimal.ZERO)
                    .rateLimitMax(java.math.BigDecimal.ZERO)
                    .build());
        } else {
            businessRules.get(0).setRateLimitMin(value != null ? value : java.math.BigDecimal.ZERO);
        }
    }

    public void setMaximumInterest(java.math.BigDecimal value) {
        if (businessRules == null) {
            businessRules = new ArrayList<>();
        }
        if (businessRules.isEmpty()) {
            businessRules.add(ProductBusinessRule.builder()
                    .termLimitMin(0)
                    .termLimitMax(0)
                    .rateLimitMin(java.math.BigDecimal.ZERO)
                    .rateLimitMax(value != null ? value : java.math.BigDecimal.ZERO)
                    .build());
        } else {
            businessRules.get(0).setRateLimitMax(value != null ? value : java.math.BigDecimal.ZERO);
        }
    }

    @PrePersist
    protected void onPrePersist() {
        String currentUser = getCurrentAuditor();
        if (this.id == null) this.id = "PROD-" + java.util.UUID.randomUUID().toString();
        if (this.oooUserId == null) this.oooUserId = truncate(currentUser, 32);
        this.updatedBy = currentUser;
        if (this.oooWsId == null) this.oooWsId = "DEFAULT";
        if (this.oooLocalTs == null) this.oooLocalTs = LocalDateTime.now();
        if (this.oooHostTs == null) this.oooHostTs = LocalDateTime.now();
        if (this.ruleSystemId == null) this.ruleSystemId = "RULES_SYS";
        if (this.ldbid == null) this.ldbid = 1;
        if (this.oooAcptTs == null) this.oooAcptTs = LocalDateTime.now();
        if (this.oooAcptTsUtcOfst == null) this.oooAcptTsUtcOfst = "+05:30";
        if (this.uuid == null) this.uuid = java.util.UUID.randomUUID().toString();
        if (this.status == null) this.status = ProductStatus.ACTIVE;
        this.isActive = (this.status == ProductStatus.ACTIVE);
    }

    @PreUpdate
    protected void onPreUpdate() {
        String currentUser = getCurrentAuditor();
        this.updatedBy = currentUser;
        this.oooUserId = truncate(currentUser, 32);
        this.oooHostTs = LocalDateTime.now();
        this.isActive = (this.status == ProductStatus.ACTIVE);
    }

    private String truncate(String val, int maxLen) {
        if (val == null) return null;
        return val.length() > maxLen ? val.substring(0, maxLen) : val;
    }

    private String getCurrentAuditor() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
                return authentication.getName();
            }
        } catch (Exception ignored) {
        }
        return "SYSTEM";
    }
}
