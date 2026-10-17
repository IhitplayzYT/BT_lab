package com.bank.product.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = {"com.bank.product.repository", "com.bank.fdcalculator.repository"})
@EntityScan(basePackages = {"com.bank.product.entity", "com.bank.fdcalculator.entity"})
public class DatabaseConfig {
}
