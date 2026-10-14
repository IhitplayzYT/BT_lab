package com.example.fdstatement;
import org.springframework.boot.SpringApplication;import org.springframework.boot.autoconfigure.SpringBootApplication;import org.springframework.context.annotation.Import;import com.example.fdshared.EventInfrastructure;
@SpringBootApplication @Import(EventInfrastructure.class) public class Application {public static void main(String[] args){SpringApplication.run(Application.class,args);}}
