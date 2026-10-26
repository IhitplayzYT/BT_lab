package com.example.fdshared;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.core.JacksonException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.apache.kafka.common.TopicPartition;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.KafkaAdmin;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.scheduling.annotation.*;
import org.springframework.util.backoff.FixedBackOff;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import com.fasterxml.jackson.databind.Module;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Arrays;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableScheduling
public class EventInfrastructure {
 public static final String[] TOPICS = {
  "command.interest.accrual", "command.interest.payout", "event.interest.accrued",
  "event.interest.paid", "event.batch.completed", "event.batch.failed", "event.fd.matured",
  "event.fd.prematurely-closed", "event.fd.created", "event.fd.status-changed"
 };
 @Bean
 Outbox outbox(JdbcTemplate jdbc, ObjectMapper mapper) { return new Outbox(jdbc, mapper); }

 // JDBC returns SQL DATE columns as java.sql.Date. Jackson would write them as a UTC instant
 // (2026-10-12T18:30:00.000Z for 13 Oct in IST); keep the plain yyyy-MM-dd the APIs returned before.
 @Bean SimpleModule sqlDateAsPlainDate() {
  return new SimpleModule("sql-date-as-plain-date")
   .addSerializer(java.sql.Date.class, ToStringSerializer.instance);
 }

 @Bean Module javaTimeModule() {
  return new JavaTimeModule();
 }

 /** Minimal apps (e.g. event-common tests) may not pull in Jackson auto-configuration. */
 @Bean @ConditionalOnMissingBean
 ObjectMapper objectMapper(ObjectProvider<Module> modules) {
  ObjectMapper mapper = new ObjectMapper();
  modules.forEach(mapper::registerModule);
  mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
  return mapper;
 }

 @Bean @ConditionalOnProperty(name="events.enabled",havingValue="true",matchIfMissing=true)
 KafkaAdmin.NewTopics topics(@Value("${events.topic-partitions:3}") int partitions,
                            @Value("${events.topic-replicas:1}") int replicas) {
  var topics = Arrays.stream(TOPICS).flatMap(name -> java.util.stream.Stream.of(name,name+".DLT"))
   .map(name -> TopicBuilder.name(name).partitions(partitions).replicas(replicas).build())
   .toArray(org.apache.kafka.clients.admin.NewTopic[]::new);
  return new KafkaAdmin.NewTopics(topics);
 }

 @Bean @ConditionalOnProperty(name="events.enabled",havingValue="true",matchIfMissing=true)
 DefaultErrorHandler kafkaErrorHandler(KafkaTemplate<String,String> kafka) {
  var recoverer = new DeadLetterPublishingRecoverer(kafka,
   (record,error) -> new TopicPartition(record.topic()+".DLT",record.partition()));
  // Do not advance a failed record if its dead-letter publication failed.
  recoverer.setFailIfSendResultIsError(true);
  recoverer.setWaitForSendResultTimeout(java.time.Duration.ofSeconds(10));
  var handler = new DefaultErrorHandler(recoverer,new FixedBackOff(1000L,4L));
  handler.addNotRetryableExceptions(InvalidEventException.class,
   JacksonException.class);
  handler.setAckAfterHandle(true);
  return handler;
 }

 @Bean @ConditionalOnProperty(name="events.enabled",havingValue="true",matchIfMissing=true)
 Relay relay(JdbcTemplate jdbc,KafkaTemplate<String,String> kafka,ObjectMapper mapper) {
  return new Relay(jdbc,kafka,mapper);
 }
 public static class Relay {
  private static final Logger log=LoggerFactory.getLogger(Relay.class);
  private final JdbcTemplate jdbc;
  private final KafkaTemplate<String,String> kafka;
  private final ObjectMapper mapper;
  Relay(JdbcTemplate jdbc,KafkaTemplate<String,String> kafka,ObjectMapper mapper) {
   this.jdbc=jdbc;this.kafka=kafka;this.mapper=mapper;
  }
  @Scheduled(fixedDelayString="${events.relay-delay-ms:3000}")
  public void publish() {
   for(var row:jdbc.queryForList("SELECT event_id,routing_key,payload FROM event_outbox WHERE published_at IS NULL ORDER BY created_at,event_id LIMIT 50")) {
    try {
     String id=row.get("event_id").toString(),topic=row.get("routing_key").toString(),body=row.get("payload").toString();
     if(!Arrays.asList(TOPICS).contains(topic)) throw new InvalidEventException("Unknown event topic: "+topic);
     DomainEvent event=mapper.readValue(body,DomainEvent.class);
     // Aggregate keys preserve order within each topic/partition.
     kafka.send(topic,event.aggregateId(),body).get(10,TimeUnit.SECONDS);
     jdbc.update("UPDATE event_outbox SET published_at=CURRENT_TIMESTAMP WHERE event_id=? AND published_at IS NULL",id);
    } catch(Exception error) {
     if(error instanceof InterruptedException) Thread.currentThread().interrupt();
     log.warn("Outbox delivery pending: {}",error.toString());break;
    }
   }
  }
 }
}
