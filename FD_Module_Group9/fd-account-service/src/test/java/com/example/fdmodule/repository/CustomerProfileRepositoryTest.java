package com.example.fdmodule.repository;

import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/** Regression: every new customer used to get CUST000002 and take over its FDs. */
class CustomerProfileRepositoryTest {

    @Test
    void nextCustomerIdSkipsIdsThatAlreadyExist() {
        // The live data that triggered the bug: legacy seed CUST001 plus CUST000002.
        Set<String> existing = Set.of("CUST001", "CUST000002");
        CustomerProfileRepository repo = mock(CustomerProfileRepository.class);
        when(repo.nextCustomerId()).thenCallRealMethod();
        when(repo.count()).thenReturn((long) existing.size());
        when(repo.existsById(anyString())).thenAnswer(inv -> existing.contains(inv.getArgument(0)));

        assertThat(repo.nextCustomerId()).isEqualTo("CUST000003");

        when(repo.count()).thenReturn(1L); // count lags behind the highest ID
        assertThat(repo.nextCustomerId()).isEqualTo("CUST000003");
    }
}
