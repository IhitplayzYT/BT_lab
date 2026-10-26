package com.example.fdmodule.repository;

import com.example.fdmodule.entity.FDTransaction;
import org.springframework.data.repository.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Lab 16 - persistence for the append-only {@code fd_transactions} ledger.
 *
 * <p>Deliberately extends the minimal {@link Repository} marker rather than
 * {@code JpaRepository}, so no update or delete operations are exposed.
 */
public interface FDTransactionRepository extends Repository<FDTransaction, Long> {

    FDTransaction save(FDTransaction transaction);

    Optional<FDTransaction> findById(Long txnId);

    /** Transaction history for one FD account, oldest first. */
    List<FDTransaction> findByFdAccountNoOrderByTxnTimestampAscTxnIdAsc(String fdAccountNo);

    /** Used for duplicate protection of the single initial DEPOSIT. */
    Optional<FDTransaction> findFirstByFdAccountNoAndTxnTypeOrderByTxnIdAsc(String fdAccountNo, String txnType);

    long countByFdAccountNo(String fdAccountNo);

    /** Get all transactions for journal view (read-only) */
    List<FDTransaction> findAllByOrderByTxnTimestampAscTxnIdAsc();
}
