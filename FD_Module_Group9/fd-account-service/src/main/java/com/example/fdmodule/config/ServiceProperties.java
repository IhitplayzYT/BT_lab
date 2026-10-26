package com.example.fdmodule.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "services")
public class ServiceProperties {
    private ProductService product;
    private CalculatorService calculator;
    private AuthService auth;

    public ProductService getProduct() {
        return product;
    }

    public void setProduct(ProductService product) {
        this.product = product;
    }

    public CalculatorService getCalculator() {
        return calculator;
    }

    public void setCalculator(CalculatorService calculator) {
        this.calculator = calculator;
    }

    public AuthService getAuth() {
        return auth;
    }

    public void setAuth(AuthService auth) {
        this.auth = auth;
    }

    public static class ProductService {
        private String baseUrl;
        private int connectTimeoutMs;
        private int readTimeoutMs;

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }

        public int getConnectTimeoutMs() {
            return connectTimeoutMs;
        }

        public void setConnectTimeoutMs(int connectTimeoutMs) {
            this.connectTimeoutMs = connectTimeoutMs;
        }

        public int getReadTimeoutMs() {
            return readTimeoutMs;
        }

        public void setReadTimeoutMs(int readTimeoutMs) {
            this.readTimeoutMs = readTimeoutMs;
        }
    }

    public static class CalculatorService {
        private String baseUrl;
        private int connectTimeoutMs;
        private int readTimeoutMs;

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }

        public int getConnectTimeoutMs() {
            return connectTimeoutMs;
        }

        public void setConnectTimeoutMs(int connectTimeoutMs) {
            this.connectTimeoutMs = connectTimeoutMs;
        }

        public int getReadTimeoutMs() {
            return readTimeoutMs;
        }

        public void setReadTimeoutMs(int readTimeoutMs) {
            this.readTimeoutMs = readTimeoutMs;
        }
    }

    public static class AuthService {
        private String baseUrl;

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }
    }
}
