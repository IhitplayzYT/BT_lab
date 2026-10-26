package com.example.fdnotify;

import com.example.fdshared.EventInfrastructure;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Lab L18 - notification microservice: consumes FD events from Kafka and sends alerts. */
@SpringBootApplication
@Import(EventInfrastructure.class)
@EnableScheduling
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
