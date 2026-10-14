package com.example.fdbatch;
import com.example.fdshared.DomainEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
@Component @ConditionalOnProperty(name="events.enabled",havingValue="true",matchIfMissing=true) public class ResultListener {
 private final ObjectMapper mapper;private final BatchService service;public ResultListener(ObjectMapper mapper,BatchService service){this.mapper=mapper;this.service=service;}
 @KafkaListener(topics={"event.batch.completed","event.batch.failed"},groupId="fd-batch-results-v1") public void receive(String body)throws Exception{service.result(mapper.readValue(body,DomainEvent.class));}
}
