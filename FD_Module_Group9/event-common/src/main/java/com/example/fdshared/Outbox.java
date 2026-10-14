package com.example.fdshared;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JacksonException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import java.time.Instant;
import java.util.UUID;
public class Outbox {
 private final JdbcTemplate jdbc; private final ObjectMapper mapper;
 public Outbox(JdbcTemplate jdbc,ObjectMapper mapper){this.jdbc=jdbc;this.mapper=mapper;}
 public String emit(String routing,String type,String aggregate,Object data){
  if(!TransactionSynchronizationManager.isActualTransactionActive()) throw new IllegalStateException("Outbox must join a database transaction");
  String id=UUID.randomUUID().toString();
  try {String payload=mapper.writeValueAsString(new DomainEvent(1,id,type,Instant.now(),aggregate,mapper.valueToTree(data)));
   jdbc.update("INSERT INTO event_outbox(event_id,routing_key,payload,created_at) VALUES(?,?,?,CURRENT_TIMESTAMP)",id,routing,payload);return id;
  } catch(JacksonException e){throw new IllegalStateException(e);}
 }
}
