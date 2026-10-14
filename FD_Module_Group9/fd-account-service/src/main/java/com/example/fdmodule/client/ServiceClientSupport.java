package com.example.fdmodule.client;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;

final class ServiceClientSupport {

    private ServiceClientSupport() {}

    static HttpEntity<Void> getEntity(HttpHeaders authHeaders) {
        HttpHeaders headers = new HttpHeaders();
        headers.putAll(authHeaders);
        headers.set("Accept", "application/json");
        return new HttpEntity<>(headers);
    }

    static HttpEntity<String> jsonEntity(HttpHeaders authHeaders, String body) {
        HttpHeaders headers = new HttpHeaders();
        headers.putAll(authHeaders);
        headers.set("Accept", "application/json");
        headers.set("Content-Type", "application/json");
        return new HttpEntity<>(body, headers);
    }
}
