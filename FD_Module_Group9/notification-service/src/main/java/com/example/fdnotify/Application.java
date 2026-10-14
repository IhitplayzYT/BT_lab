package com.example.fdnotify;

import com.example.fdshared.EventInfrastructure;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

/** Lab L18 - notification microservice: consumes FD events from Kafka and sends alerts. */
@SpringBootApplication
@Import(EventInfrastructure.class)
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
