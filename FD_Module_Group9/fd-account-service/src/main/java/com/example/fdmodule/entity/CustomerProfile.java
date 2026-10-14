package com.example.fdmodule.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "customer_profile")
public class CustomerProfile {
    @Id
    @Column(name = "customer_id", length = 20)
    private String customerId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "full_name")
    private String fullName;

    private String phone;
    private String address;

    @Column(name = "pii_masked_aadhaar")
    private String piiMaskedAadhaar;

    private String category;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPiiMaskedAadhaar() { return piiMaskedAadhaar; }
    public void setPiiMaskedAadhaar(String piiMaskedAadhaar) { this.piiMaskedAadhaar = piiMaskedAadhaar; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
