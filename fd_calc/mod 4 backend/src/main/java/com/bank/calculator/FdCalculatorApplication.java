package com.bank.calculator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * FD Calculator Microservice – Banking Technology Lab.
 *
 * create FD accounts, store deposits, debit or
 * credit money, initiate payouts, or schedule any financial events.
 */
@SpringBootApplication
@EnableFeignClients(basePackages = "com.bank.calculator.client")
@ConfigurationPropertiesScan("com.bank.calculator")
@EnableAsync
public class FdCalculatorApplication {

    public static void main(String[] args) {
        SpringApplication.run(FdCalculatorApplication.class, args);
    }
}
