package com.example.fdauth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/** Short-lived, persisted state for email-verified customer signup. */
@Entity
@Table(name = "signup_challenges")
public class SignupChallenge {
    @Id
    @Column(length = 255, nullable = false)
    private String email;

    @Column(nullable = false, length = 100)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "otp_hash", nullable = false, length = 255)
    private String otpHash;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "user_id")
    private Long userId;

    protected SignupChallenge() { }

    public SignupChallenge(String email, String username, String passwordHash, String otpHash, LocalDateTime expiresAt) {
        this.email = email;
        this.username = username;
        this.passwordHash = passwordHash;
        this.otpHash = otpHash;
        this.expiresAt = expiresAt;
        this.userId = null;
    }

    public String getEmail() { return email; }
    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
    public String getOtpHash() { return otpHash; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setOtpHash(String otpHash) { this.otpHash = otpHash; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}
