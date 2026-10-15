package com.example.fdmodule.repository;

import com.example.fdmodule.entity.CustomerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, String> {
    Optional<CustomerProfile> findByUserId(Long userId);
    default Optional<CustomerProfile> findByUserIdString(String userIdStr) {
        try {
            return findByUserId(Long.parseLong(userIdStr));
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }
}
