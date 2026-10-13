package com.bank.calculator.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MetricsConfig {

    @Bean
    public Counter calculationCounter(MeterRegistry registry) {
        return Counter.builder("fd.calculations.total")
                .description("Total number of FD calculations performed")
                .tag("service", "fd-calculator")
                .register(registry);
    }

    @Bean
    public Counter calculationErrorCounter(MeterRegistry registry) {
        return Counter.builder("fd.calculations.errors")
                .description("Total number of FD calculation errors")
                .tag("service", "fd-calculator")
                .register(registry);
    }

    @Bean
    public Timer calculationTimer(MeterRegistry registry) {
        return Timer.builder("fd.calculations.duration")
                .description("Duration of FD calculations")
                .tag("service", "fd-calculator")
                .register(registry);
    }

    @Bean
    public Counter cacheHitCounter(MeterRegistry registry) {
        return Counter.builder("fd.cache.hits")
                .description("Cache hits for product rate lookups")
                .tag("service", "fd-calculator")
                .register(registry);
    }

    @Bean
    public Counter cacheMissCounter(MeterRegistry registry) {
        return Counter.builder("fd.cache.misses")
                .description("Cache misses for product rate lookups")
                .tag("service", "fd-calculator")
                .register(registry);
    }
}
