package com.example.fdmodule.repository;

import com.example.fdmodule.entity.FixedDepositAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FixedDepositAccountRepository extends JpaRepository<FixedDepositAccount, String> {
    long countByProductCode(String productCode);
    List<FixedDepositAccount> findByApprovalStatus(String approvalStatus);
    List<FixedDepositAccount> findByCustomerId(String customerId);
}
