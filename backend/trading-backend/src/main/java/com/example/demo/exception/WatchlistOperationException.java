package com.example.demo.exception;

public class WatchlistOperationException extends RuntimeException {
  public WatchlistOperationException(String message) {
    super(message);
  }
  public WatchlistOperationException(String message, Throwable cause) {
    super(message, cause);
  }
}
