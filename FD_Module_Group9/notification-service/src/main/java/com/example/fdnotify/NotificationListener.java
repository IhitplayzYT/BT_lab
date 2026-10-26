package com.example.fdnotify;

import com.example.fdshared.DomainEvent;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;

/** Own consumer group: this service never steals messages from the statement or batch consumers. */
@Component
@ConditionalOnProperty(name = "events.enabled", havingValue = "true", matchIfMissing = true)
public class NotificationListener {
    private final ObjectMapper mapper;
    private final NotificationService service;

    public NotificationListener(ObjectMapper mapper, NotificationService service) {
        this.mapper = mapper;
        this.service = service;
    }

    @KafkaListener(topics = {"event.fd.status-changed", "event.interest.accrued", "event.fd.created", "event.interest.paid", "event.fd.matured", "event.fd.prematurely-closed"},
            groupId = "fd-notifications-v1")
    public void receive(String body) throws Exception {
        service.handle(mapper.readValue(body, DomainEvent.class));
    }
}
