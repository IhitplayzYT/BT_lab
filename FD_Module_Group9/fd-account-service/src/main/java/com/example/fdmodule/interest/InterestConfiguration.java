package com.example.fdmodule.interest;
import org.springframework.context.annotation.*;
import com.example.fdshared.EventInfrastructure;
@Configuration @Import(EventInfrastructure.class) public class InterestConfiguration {}
