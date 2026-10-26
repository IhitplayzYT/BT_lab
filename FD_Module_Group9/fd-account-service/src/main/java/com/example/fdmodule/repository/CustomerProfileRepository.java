package com.example.fdmodule.repository;

import com.example.fdmodule.entity.CustomerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, String> {
    Optional<CustomerProfile> findByUserId(Long userId);

    @org.springframework.data.jpa.repository.Query(value = "SELECT c.* FROM customer_profile c JOIN users u ON u.id=c.user_id WHERE u.username=:username LIMIT 1", nativeQuery = true)
    Optional<CustomerProfile> findByUsername(@org.springframework.data.repository.query.Param("username") String username);

    @org.springframework.data.jpa.repository.Query(value = "SELECT MAX(customer_id) FROM customer_profile WHERE customer_id LIKE 'CUST%'", nativeQuery = true)
    String findMaxCustomerId();

    default Optional<CustomerProfile> findByUserIdString(String userIdStr) {
        try {
            return findByUserId(Long.parseLong(userIdStr));
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }
}
