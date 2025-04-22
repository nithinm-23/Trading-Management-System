package com.example.demo.model;

public class TradeExecutionException extends RuntimeException {
    public TradeExecutionException(String message) {
        super(message);
    }

    public TradeExecutionException(String message, Throwable cause) {
        super(message, cause);
    }
}