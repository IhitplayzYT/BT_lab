package com.example.fdmodule;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FdModuleApplication {
    public static void main(String[] args) {
        SpringApplication.run(FdModuleApplication.class, args);
    }
}
