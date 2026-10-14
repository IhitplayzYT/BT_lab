package com.example.fdstatement;
import com.example.fdshared.DomainEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
@Component @ConditionalOnProperty(name="events.enabled",havingValue="true",matchIfMissing=true) public class StatementListener {
 private final ObjectMapper mapper;private final StatementService service;public StatementListener(ObjectMapper mapper,StatementService service){this.mapper=mapper;this.service=service;}
 @KafkaListener(topics={"event.interest.accrued","event.interest.paid"},groupId="fd-statements-v1") public void receive(String body)throws Exception{service.project(mapper.readValue(body,DomainEvent.class));}
}
