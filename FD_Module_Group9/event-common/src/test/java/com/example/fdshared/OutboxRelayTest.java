package com.example.fdshared;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import static org.mockito.Mockito.*;
class OutboxRelayTest {
 JdbcTemplate jdbc=mock(JdbcTemplate.class);
 @SuppressWarnings("unchecked") KafkaTemplate<String,String> kafka=mock(KafkaTemplate.class);
 ObjectMapper mapper=new ObjectMapper().registerModule(new JavaTimeModule());
 String body="{\"schemaVersion\":1,\"eventId\":\"id\",\"eventType\":\"InterestAccrued\",\"occurredAt\":\"2026-10-11T00:00:00Z\",\"aggregateId\":\"FD001\",\"data\":{}}";
 void row(){when(jdbc.queryForList(anyString())).thenReturn(List.of(Map.of("event_id","id","routing_key","event.interest.accrued","payload",body)));}
 @Test void acknowledgedPublishMarked(){row();when(kafka.send(anyString(),anyString(),anyString())).thenReturn(CompletableFuture.completedFuture(mock(SendResult.class)));new EventInfrastructure.Relay(jdbc,kafka,mapper).publish();verify(kafka).send("event.interest.accrued","FD001",body);verify(jdbc).update(anyString(),eq("id"));}
 @Test void failedAcknowledgmentRemainsPending(){row();when(kafka.send(anyString(),anyString(),anyString())).thenReturn(CompletableFuture.failedFuture(new IllegalStateException("failed")));new EventInfrastructure.Relay(jdbc,kafka,mapper).publish();verify(jdbc,never()).update(anyString(),any(Object[].class));}
 @Test void unavailableBrokerRemainsPending(){row();when(kafka.send(anyString(),anyString(),anyString())).thenThrow(new IllegalStateException("offline"));new EventInfrastructure.Relay(jdbc,kafka,mapper).publish();verify(jdbc,never()).update(anyString(),any(Object[].class));}
 @Test void invalidTopicRemainsPending(){row();when(jdbc.queryForList(anyString())).thenReturn(List.of(Map.of("event_id","id","routing_key","unknown","payload",body)));new EventInfrastructure.Relay(jdbc,kafka,mapper).publish();verifyNoInteractions(kafka);verify(jdbc,never()).update(anyString(),any(Object[].class));}
 @Test void outboxRequiresTransaction(){org.assertj.core.api.Assertions.assertThatThrownBy(()->new Outbox(jdbc,mapper).emit("topic","type","account",Map.of())).isInstanceOf(IllegalStateException.class);verifyNoInteractions(jdbc);}
}
