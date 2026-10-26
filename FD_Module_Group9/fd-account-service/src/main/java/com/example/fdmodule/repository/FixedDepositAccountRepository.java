package com.example.fdmodule.repository;

import com.example.fdmodule.entity.FixedDepositAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FixedDepositAccountRepository extends JpaRepository<FixedDepositAccount, String> {
    long countByProductCode(String productCode);
    List<FixedDepositAccount> findByApprovalStatus(String approvalStatus);
    List<FixedDepositAccount> findByCustomerId(String customerId);
    List<FixedDepositAccount> findByCustomerIdIn(List<String> customerIds);
    
    /** Search accounts by customer name (full name or parts) */
    List<FixedDepositAccount> findByApplicantFullNameContainingIgnoreCase(String name);
    
    /** Search accounts by customer ID */
    List<FixedDepositAccount> findByCustomerIdContainingIgnoreCase(String customerId);
}
