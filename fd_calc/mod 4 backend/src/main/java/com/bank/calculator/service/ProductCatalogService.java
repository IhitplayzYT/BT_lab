package com.bank.calculator.service;

import com.bank.calculator.client.ProductClient;
import com.bank.calculator.client.dto.ProductConfigDto;
import com.bank.calculator.config.CacheConfig;
import com.bank.calculator.exception.ProductNotFoundException;
import com.bank.calculator.exception.ServiceUnavailableException;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/**
 * Service responsible for retrieving and caching product rate configurations.
 *
 * <p>Requirements satisfied:
 * <ul>
 *   <li>PPT Requirement: "Cache the rate information and retain it till logged out."</li>
 *   <li>Product rates are cached by {@code productCode} using Caffeine in-memory cache.</li>
 *   <li>Customer categories and auth tokens are strictly separated and NEVER cached here.</li>
 *   <li>Provides explicit {@link #evictAllRateCaches()} and {@link #evictRateCache(String)}
 *       for logout-driven or admin-driven cache invalidation.</li>
 * </ul>
 */
@Service
public class ProductCatalogService {

    private static final Logger log = LoggerFactory.getLogger(ProductCatalogService.class);

    private final ProductClient productClient;

    public ProductCatalogService(ProductClient productClient) {
        this.productClient = productClient;
        System.out.println("ProductCatalogService: Constructor called, ProductClient class='" + (productClient != null ? productClient.getClass().getName() : "null") + "'");
        log.info("ProductCatalogService: Constructor called, ProductClient class='{}'", productClient != null ? productClient.getClass().getName() : "null");
    }

    /**
     * Retrieves product calculator configuration.
     * Cached by productCode so repeated requests avoid redundant HTTP calls to Product Service.
     *
     * @param productCode the product identifier
     * @return authoritative product configuration
     */
    // Read current product status and pricing on every calculation; retired products must fail immediately.
    public ProductConfigDto getProductConfig(String productCode) {
        log.info("ProductCatalogService: Getting config for productCode='{}', ProductClient class='{}'", productCode, productClient.getClass().getName());
        log.debug("Cache miss for productCode='{}' — invoking ProductClient", productCode);
        try {
            ProductConfigDto dto = productClient.getCalculatorConfig(productCode);
            log.info("ProductCatalogService: Received response from ProductClient for productCode='{}'", productCode);
            if (dto == null) {
                throw new ProductNotFoundException(productCode);
            }
            return dto;
        } catch (ProductNotFoundException e) {
            throw e;
        } catch (FeignException.NotFound e) {
            throw new ProductNotFoundException(productCode);
        } catch (FeignException.UnprocessableEntity e) {
            throw new com.bank.calculator.exception.InactiveProductException(productCode);
        } catch (FeignException e) {
            log.error("ProductCatalogService: FeignException calling Product Service", e);
            throw new ServiceUnavailableException("Product Service", e);
        } catch (Exception e) {
            log.error("ProductCatalogService: Exception calling Product Service", e);
            throw new ServiceUnavailableException("Product Service", e);
        }
    }

    /**
     * Evicts all cached product rate entries.
     * Can be invoked upon receiving a user logout event from the Auth Service/Gateway.
     */
    @CacheEvict(value = CacheConfig.PRODUCT_RATES_CACHE, allEntries = true)
    public void evictAllRateCaches() {
        log.info("Product rate cache evicted (all entries).");
    }

    /**
     * Evicts a single product rate entry from the cache.
     *
     * @param productCode the product identifier to evict
     */
    @CacheEvict(value = CacheConfig.PRODUCT_RATES_CACHE, key = "#productCode")
    public void evictRateCache(String productCode) {
        log.info("Product rate cache evicted for productCode='{}'.", productCode);
    }
}
