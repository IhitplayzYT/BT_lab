package com.bank.calculator.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Cache configuration for the FD Calculator microservice.
 *
 * <p>Caches product rate configurations in memory using Caffeine, satisfying
 * the Banking Technology Lab PPT requirement: "Cache the rate information".
 *
 * <p>Customer categories and user identities are NEVER cached here — only
 * product catalog definitions.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String PRODUCT_RATES_CACHE = "productRates";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(PRODUCT_RATES_CACHE);
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(500)
                .expireAfterWrite(60, TimeUnit.MINUTES)
                .recordStats());
        return cacheManager;
    }
}
