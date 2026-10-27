package com.example.fdmodule.repository;

import com.example.fdmodule.entity.CustomerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, String> {
    Optional<CustomerProfile> findByUserId(Long userId);
    List<CustomerProfile> findAllByUserId(Long userId);

    @org.springframework.data.jpa.repository.Query(value = "SELECT c.* FROM customer_profile c JOIN users u ON u.id=c.user_id WHERE u.username=:username LIMIT 1", nativeQuery = true)
    Optional<CustomerProfile> findByUsername(@org.springframework.data.repository.query.Param("username") String username);

    // Never hand out an ID that already exists: customer_id is an assigned @Id, so save() on a
    // reused ID silently merges over the other user's profile (the old string MAX(customer_id)
    // ranked 'CUST001' above 'CUST000002' and gave every new user CUST000002).
    // ponytail: two concurrent signups can still pick the same ID; use a DB sequence if that matters.
    default String nextCustomerId() {
        long next = count() + 1;
        while (existsById(String.format("CUST%06d", next))) next++;
        return String.format("CUST%06d", next);
    }

    default Optional<CustomerProfile> findByUserIdString(String userIdStr) {
        try {
            return findByUserId(Long.parseLong(userIdStr));
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }
}
