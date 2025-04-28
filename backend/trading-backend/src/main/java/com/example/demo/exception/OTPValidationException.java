package com.example.demo.exception;

public class OTPValidationException extends RuntimeException {
    public OTPValidationException(String message) {
        super(message);
    }
}
