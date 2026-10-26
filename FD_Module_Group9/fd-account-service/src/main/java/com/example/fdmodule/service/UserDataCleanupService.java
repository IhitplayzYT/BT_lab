package com.example.fdmodule.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/** Detaches a deleted login from its customer data without deleting the financial audit trail. */
@Service
public class UserDataCleanupService {
    private final JdbcTemplate jdbc;

    public UserDataCleanupService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional
    public void detach(String username) {
        Long userId = jdbc.query("SELECT id FROM users WHERE username = ?", rs ->
                rs.next() ? rs.getLong(1) : null, username);

        if (userId == null) {
            System.err.println("WARNING: User not found in users table for username: " + username);
            return;
        }

        // Get all customer_ids associated with this user_id before deleting
        String customerIds = jdbc.query(
            "SELECT customer_id FROM customer_profile WHERE user_id = ?",
            rs -> {
                StringBuilder sb = new StringBuilder();
                while (rs.next()) {
                    if (sb.length() > 0) sb.append(",");
                    sb.append("'").append(rs.getString(1)).append("'");
                }
                return sb.toString();
            }, userId);

        if (customerIds != null && !customerIds.isEmpty()) {
            // DELETE pending applications (not approved yet) - complete wipe
            int deletedPendingFDs = jdbc.update(
                "DELETE FROM fd_accounts WHERE customer_id IN (" + customerIds + ") AND " +
                "(status = 'PENDING' OR approval_status = 'PENDING_APPROVAL' OR approval_status = 'REJECTED')"
            );
            System.out.println("Deleted " + deletedPendingFDs + " pending/rejected FD accounts for user: " + username);
            
            int deletedPendingBundles = jdbc.update(
                "DELETE FROM bundle_applications WHERE customer_id IN (" + customerIds + ") AND " +
                "(status = 'PENDING' OR approval_status = 'PENDING_APPROVAL' OR approval_status = 'REJECTED')"
            );
            System.out.println("Deleted " + deletedPendingBundles + " pending/rejected bundle applications for user: " + username);

            // Archive approved/active accounts for audit trail
            String archivedCustomerId = "DEL" + UUID.randomUUID().toString().replace("-", "").substring(0, 17);
            int archivedFDs = jdbc.update(
                "UPDATE fd_accounts SET customer_id = ? WHERE customer_id IN (" + customerIds + ") AND " +
                "(status != 'PENDING' AND approval_status != 'PENDING_APPROVAL' AND approval_status != 'REJECTED')",
                archivedCustomerId
            );
            System.out.println("Archived " + archivedFDs + " approved/active FD accounts for user: " + username);
            
            int archivedBundles = jdbc.update(
                "UPDATE bundle_applications SET customer_id = ? WHERE customer_id IN (" + customerIds + ") AND " +
                "(status != 'PENDING' AND approval_status != 'PENDING_APPROVAL' AND approval_status != 'REJECTED')",
                archivedCustomerId
            );
            System.out.println("Archived " + archivedBundles + " approved/active bundle applications for user: " + username);

            // Delete the customer_profile entries entirely to prevent reuse
            jdbc.update("DELETE FROM customer_profile WHERE user_id = ?", userId);
        } else {
            // Fallback: if no customer_profile found, at least set user_id to NULL
            jdbc.update("UPDATE customer_profile SET user_id = NULL WHERE user_id = ?", userId);
        }

        jdbc.update("DELETE FROM users WHERE id = ?", userId);
    }

    @Transactional
    public void syncCustomerProfile(String username, String email, Long userId) {
        // Check if customer profile already exists for this user_id
        Long existingUserId = jdbc.query(
            "SELECT user_id FROM customer_profile WHERE user_id = ?",
            rs -> rs.next() ? rs.getLong(1) : null,
            userId
        );

        if (existingUserId != null) {
            System.out.println("Customer profile already exists for userId: " + userId);
            return;
        }

        // Generate a new customer_id
        String maxCustomerId = jdbc.queryForObject("SELECT MAX(customer_id) FROM customer_profile", String.class);
        int nextNum = 1;
        if (maxCustomerId != null && maxCustomerId.startsWith("CUST")) {
            try {
                nextNum = Integer.parseInt(maxCustomerId.substring(4)) + 1;
            } catch (NumberFormatException e) {
                nextNum = 1;
            }
        }
        String customerId = String.format("CUST%06d", nextNum);

        // Create customer profile with the correct user_id from auth-service
        jdbc.update(
            "INSERT INTO customer_profile (customer_id, user_id, full_name, phone, category) VALUES (?, ?, ?, ?, ?)",
            customerId, userId, username, "", "GENERAL"
        );

        System.out.println("Created customer profile: customerId=" + customerId + ", userId=" + userId + ", username=" + username);
    }
}
