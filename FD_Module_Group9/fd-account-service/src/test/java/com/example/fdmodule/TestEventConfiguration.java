package com.example.fdmodule;

import com.example.fdshared.Outbox;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;

/** Exercise transactional event creation without starting Kafka consumers in H2 tests. */
@Configuration
@Profile("test")
public class TestEventConfiguration {
    @Bean com.example.fdmodule.service.FdCreatedPublisher testPublisher() {
        return org.mockito.Mockito.mock(com.example.fdmodule.service.FdCreatedPublisher.class);
    }

    @Bean Outbox testOutbox(JdbcTemplate jdbc, ObjectMapper mapper) {
        return new Outbox(jdbc, mapper);
    }
}
