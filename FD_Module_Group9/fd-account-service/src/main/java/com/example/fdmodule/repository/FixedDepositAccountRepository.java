package com.example.fdmodule.repository;

import com.example.fdmodule.entity.FixedDepositAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FixedDepositAccountRepository extends JpaRepository<FixedDepositAccount, String> {
    long countByProductCode(String productCode);
}
