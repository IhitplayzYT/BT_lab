package com.example.fdmodule.interest;
import com.example.fdshared.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.support.TransactionTemplate;
import java.time.LocalDate;
import java.util.Map;
@Component @ConditionalOnProperty(name="events.enabled",havingValue="true",matchIfMissing=true)
public class InterestCommandListener {
 private final ObjectMapper mapper;private final InterestPostingService service;private final Outbox outbox;private final TransactionTemplate tx;private final JdbcTemplate jdbc;
 public InterestCommandListener(ObjectMapper mapper,InterestPostingService service,Outbox outbox,TransactionTemplate tx,JdbcTemplate jdbc){this.mapper=mapper;this.service=service;this.outbox=outbox;this.tx=tx;this.jdbc=jdbc;}
 @KafkaListener(topics={"command.interest.accrual","command.interest.payout"},groupId="fd-interest-posting-v1") public void receive(String body)throws Exception{
  DomainEvent e=mapper.readValue(body,DomainEvent.class);if(e.schemaVersion()!=1)throw new InvalidEventException("Unsupported event schema");
  var d=e.data();String id=d.path("requestId").asText();if(id.isBlank())throw new InvalidEventException("Missing requestId");
  try {if("InterestBatchRequested".equals(e.eventType()))service.processBatch(id,LocalDate.parse(d.path("businessDate").asText()),d.path("actor").asText());
   else if("InterestPayoutRequested".equals(e.eventType()))service.payout(id,d.path("fdAccountNo").asText(),LocalDate.parse(d.path("businessDate").asText()),d.path("actor").asText());
   else throw new InvalidEventException("Unsupported command");
  }catch(IllegalArgumentException error){tx.executeWithoutResult(status->{
   // Terminal business failures are durable; replays do not become successful later.
   if(jdbc.queryForObject("SELECT COUNT(*) FROM processed_interest_requests WHERE request_id=?",Integer.class,id)==0){jdbc.update("INSERT INTO processed_interest_requests(request_id,processed_at) VALUES(?,CURRENT_TIMESTAMP)",id);outbox.emit("event.batch.failed","InterestRequestFailed",id,Map.of("requestId",id,"status","FAILED","error",error.getMessage()));}});}
 }
}
