package com.example.fdshared;
/** Invalid contracts are sent directly to the topic's dead-letter destination. */
public class InvalidEventException extends RuntimeException {
 public InvalidEventException(String message) { super(message); }
}
