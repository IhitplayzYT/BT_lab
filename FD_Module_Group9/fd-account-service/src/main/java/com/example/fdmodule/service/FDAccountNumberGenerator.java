package com.example.fdmodule.service;

import com.example.fdmodule.repository.FixedDepositAccountRepository;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicInteger;

@Service
public class FDAccountNumberGenerator implements AccountNumberGenerator {
    private final FixedDepositAccountRepository repository;
    private final AtomicInteger sequence = new AtomicInteger(1);

    public FDAccountNumberGenerator(FixedDepositAccountRepository repository) {
        this.repository = repository;
    }

    @Override
    public synchronized String generate(String branchCode) {
        if (branchCode == null || branchCode.isBlank()) {
            throw new IllegalArgumentException("Branch code is required");
        }

        // Lab-friendly implementation of [branch][6-digit sequence][check digit].
        // The sequence starts at 000001 and advances until an unused account number is found.
        int seq = sequence.get();
        while (true) {
            if (seq > 999999) throw new IllegalStateException("Account sequence exhausted");
            String candidate = branchCode + String.format("%06d", seq) + checksum(branchCode, seq);
            if (!repository.existsById(candidate)) {
                sequence.set(seq + 1);
                return candidate;
            }
            seq++;
            sequence.set(seq);
        }
    }

    private int checksum(String branchCode, int seq) {
        return Math.floorMod(branchCode.hashCode() + seq, 9);
    }
}
