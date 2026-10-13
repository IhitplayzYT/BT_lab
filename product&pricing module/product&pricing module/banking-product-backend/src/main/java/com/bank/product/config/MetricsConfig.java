package com.bank.product.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MetricsConfig {

    @Bean
    public Counter productCreationCounter(MeterRegistry registry) {
        return Counter.builder("product.creation.total")
                .description("Total number of products created")
                .tag("service", "product-service")
                .register(registry);
    }

    @Bean
    public Counter productUpdateCounter(MeterRegistry registry) {
        return Counter.builder("product.update.total")
                .description("Total number of products updated")
                .tag("service", "product-service")
                .register(registry);
    }

    @Bean
    public Counter rateCalculationCounter(MeterRegistry registry) {
        return Counter.builder("product.rate.calculations.total")
                .description("Total number of rate calculations performed")
                .tag("service", "product-service")
                .register(registry);
    }

    @Bean
    public Timer rateCalculationTimer(MeterRegistry registry) {
        return Timer.builder("product.rate.calculations.duration")
                .description("Duration of rate calculations")
                .tag("service", "product-service")
                .register(registry);
    }

    @Bean
    public Counter cacheHitCounter(MeterRegistry registry) {
        return Counter.builder("product.cache.hits")
                .description("Cache hits for product lookups")
                .tag("service", "product-service")
                .register(registry);
    }

    @Bean
    public Counter cacheMissCounter(MeterRegistry registry) {
        return Counter.builder("product.cache.misses")
                .description("Cache misses for product lookups")
                .tag("service", "product-service")
                .register(registry);
    }

    @Bean
    public Counter batchOperationCounter(MeterRegistry registry) {
        return Counter.builder("product.batch.operations.total")
                .description("Total number of batch operations performed")
                .tag("service", "product-service")
                .register(registry);
    }
}
