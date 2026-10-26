package com.example.fdmodule.repository;

import com.example.fdmodule.entity.Nominee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NomineeRepository extends JpaRepository<Nominee, Long> {
    List<Nominee> findByFdAccountNo(String fdAccountNo);
    List<Nominee> findByFdAccountNoIn(List<String> fdAccountNos);
    void deleteByFdAccountNo(String fdAccountNo);
}
