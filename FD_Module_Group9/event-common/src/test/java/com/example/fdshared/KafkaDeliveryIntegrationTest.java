package com.example.fdshared;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.transaction.support.TransactionTemplate;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.assertThat;

/** A real embedded KRaft broker verifies transport without external infrastructure. */
@SpringBootTest(classes=KafkaDeliveryIntegrationTest.App.class,properties={
 "spring.datasource.url=jdbc:h2:mem:kafkaDelivery;DB_CLOSE_DELAY=-1",
 "spring.sql.init.mode=never",
 "events.enabled=true",
 "spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer",
 "spring.kafka.producer.value-serializer=org.apache.kafka.common.serialization.StringSerializer",
 "spring.kafka.producer.acks=all",
 "spring.kafka.producer.properties.enable.idempotence=true",
 "spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer",
 "spring.kafka.consumer.value-deserializer=org.apache.kafka.common.serialization.StringDeserializer",
 "spring.kafka.consumer.enable-auto-commit=false",
 "spring.kafka.consumer.auto-offset-reset=earliest",
 "spring.kafka.listener.ack-mode=record",
 "events.relay-delay-ms=3600000",
 "events.topic-partitions=1"
})
@EmbeddedKafka(partitions=1,bootstrapServersProperty="spring.kafka.bootstrap-servers")
@DirtiesContext
class KafkaDeliveryIntegrationTest {
 @Configuration @EnableAutoConfiguration @EnableKafka @Import(EventInfrastructure.class)
 static class App { @Bean Probe probe(){return new Probe();} }
 static class Probe {
  final BlockingQueue<ConsumerRecord<String,String>> first=new LinkedBlockingQueue<>();
  final BlockingQueue<ConsumerRecord<String,String>> second=new LinkedBlockingQueue<>();
  final BlockingQueue<ConsumerRecord<String,String>> dead=new LinkedBlockingQueue<>();
  final BlockingQueue<ConsumerRecord<String,String>> retriedDead=new LinkedBlockingQueue<>();
  final java.util.concurrent.atomic.AtomicInteger attempts=new java.util.concurrent.atomic.AtomicInteger();
  @KafkaListener(topics="event.interest.accrued",groupId="test-statements")
  void first(ConsumerRecord<String,String> record){first.add(record);}
  @KafkaListener(topics="event.interest.accrued",groupId="test-reporting")
  void second(ConsumerRecord<String,String> record){second.add(record);}
  @KafkaListener(topics="command.interest.payout",groupId="test-invalid-command")
  void invalid(String body){throw new InvalidEventException("Invalid command");}
  @KafkaListener(topics="command.interest.payout.DLT",groupId="test-dlt-observer")
  void dead(ConsumerRecord<String,String> record){dead.add(record);}
  @KafkaListener(topics="command.interest.accrual",groupId="test-transient-command")
  void transientFailure(String body){attempts.incrementAndGet();throw new IllegalStateException("Temporary dependency failure");}
  @KafkaListener(topics="command.interest.accrual.DLT",groupId="test-retried-dlt-observer")
  void retriedDead(ConsumerRecord<String,String> record){retriedDead.add(record);}
 }
 @Autowired JdbcTemplate jdbc;
 @Autowired Outbox outbox;
 @Autowired EventInfrastructure.Relay relay;
 @Autowired KafkaTemplate<String,String> kafka;
 @Autowired ObjectMapper mapper;
 @Autowired TransactionTemplate tx;
 @Autowired Probe probe;

 @Test void acknowledgedOutboxReachesIndependentConsumerGroups() throws Exception {
  jdbc.execute("CREATE TABLE IF NOT EXISTS event_outbox(event_id VARCHAR(36) PRIMARY KEY,routing_key VARCHAR(100),payload TEXT,created_at TIMESTAMP,published_at TIMESTAMP)");
  String account="FD-"+UUID.randomUUID();
  String id=tx.execute(status->outbox.emit("event.interest.accrued","InterestAccrued",account,Map.of("amount",10)));
  relay.publish();
  assertThat(jdbc.queryForObject("SELECT published_at IS NOT NULL FROM event_outbox WHERE event_id=?",Boolean.class,id)).isTrue();
  var first=probe.first.poll(30,TimeUnit.SECONDS);
  var second=probe.second.poll(30,TimeUnit.SECONDS);
  assertThat(first).isNotNull();assertThat(second).isNotNull();
  assertThat(first.key()).isEqualTo(account);
  assertThat(mapper.readValue(first.value(),DomainEvent.class).eventId()).isEqualTo(id);
  assertThat(second.value()).isEqualTo(first.value());
 }
 @Test void invalidRecordIsPublishedToDeadLetterTopic() throws Exception {
  String body="invalid-"+UUID.randomUUID();
  kafka.send("command.interest.payout","FD-invalid",body).get(10,TimeUnit.SECONDS);
  var record=probe.dead.poll(30,TimeUnit.SECONDS);
  assertThat(record).isNotNull();assertThat(record.value()).isEqualTo(body);
  assertThat(record.key()).isEqualTo("FD-invalid");
  assertThat(record.headers().toArray()).isNotEmpty();
 }
 @Test void transientFailureRetriesFiveAttemptsBeforeDeadLetter() throws Exception {
  String body="transient-"+UUID.randomUUID();
  kafka.send("command.interest.accrual","FD-retry",body).get(10,TimeUnit.SECONDS);
  var record=probe.retriedDead.poll(30,TimeUnit.SECONDS);
  assertThat(record).isNotNull();assertThat(record.value()).isEqualTo(body);
  assertThat(probe.attempts.get()).isEqualTo(5);
 }
}
