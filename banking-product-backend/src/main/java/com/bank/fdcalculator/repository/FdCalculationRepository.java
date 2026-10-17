package com.bank.fdcalculator.repository;

import com.bank.fdcalculator.entity.FdCalculation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FdCalculationRepository extends JpaRepository<FdCalculation, Long> {
    List<FdCalculation> findAllByOrderByCalculationDateDesc();
}
