package com.example.fdshared;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;
public record DomainEvent(int schemaVersion, String eventId, String eventType, Instant occurredAt, String aggregateId, JsonNode data) {}
