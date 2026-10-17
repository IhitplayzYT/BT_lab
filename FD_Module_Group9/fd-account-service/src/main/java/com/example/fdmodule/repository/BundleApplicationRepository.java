package com.example.fdmodule.repository;

import com.example.fdmodule.entity.BundleApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BundleApplicationRepository extends JpaRepository<BundleApplication, String> {
    List<BundleApplication> findByCustomerId(String customerId);
    List<BundleApplication> findByApprovalStatus(String approvalStatus);
    List<BundleApplication> findByCustomerIdAndApprovalStatus(String customerId, String approvalStatus);
}
