package com.example.demo.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

  // Handle validation exceptions
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Object> handleValidationExceptions(MethodArgumentNotValidException ex) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", LocalDateTime.now());
    body.put("status", HttpStatus.BAD_REQUEST.value());

    // Get all validation errors
    String errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.joining(", "));

    body.put("errors", errors);
    return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
  }

  // Handle IllegalArgumentException (like in your TransactionService)
  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<Object> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", LocalDateTime.now());
    body.put("status", HttpStatus.BAD_REQUEST.value());
    body.put("error", "Bad Request");
    body.put("message", ex.getMessage());
    body.put("path", request.getDescription(false).replace("uri=", ""));

    return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
  }

  // Handle all other exceptions
  @ExceptionHandler(Exception.class)
  public ResponseEntity<Object> handleAllExceptions(Exception ex, WebRequest request) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", LocalDateTime.now());
    body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
    body.put("error", "Internal Server Error");
    body.put("message", ex.getMessage());
    body.put("path", request.getDescription(false).replace("uri=", ""));

    return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<Object> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", LocalDateTime.now());
    body.put("status", HttpStatus.NOT_FOUND.value());
    body.put("error", "Not Found");
    body.put("message", ex.getMessage());
    body.put("path", request.getDescription(false).replace("uri=", ""));

    return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
  }

  @ExceptionHandler(PaymentProcessingException.class)
  public ResponseEntity<Object> handlePaymentProcessingException(PaymentProcessingException ex, WebRequest request) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", LocalDateTime.now());
    body.put("status", HttpStatus.BAD_REQUEST.value());
    body.put("error", "Payment Error");
    body.put("message", ex.getMessage());
    body.put("path", request.getDescription(false).replace("uri=", ""));

    return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(OTPValidationException.class)
  public ResponseEntity<Object> handleOTPValidationException(OTPValidationException ex, WebRequest request) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", LocalDateTime.now());
    body.put("status", HttpStatus.UNAUTHORIZED.value());
    body.put("error", "OTP Validation Failed");
    body.put("message", ex.getMessage());
    body.put("path", request.getDescription(false).replace("uri=", ""));

    return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
  }

  @ExceptionHandler(TradeExecutionException.class)
  public ResponseEntity<Object> handleTradeExecutionException(TradeExecutionException ex, WebRequest request) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", LocalDateTime.now());
    body.put("status", HttpStatus.BAD_REQUEST.value());
    body.put("error", "Trade Execution Error");
    body.put("message", ex.getMessage());
    body.put("path", request.getDescription(false).replace("uri=", ""));

    return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(IllegalStateException.class)
  public ResponseEntity<Object> handleIllegalStateException(IllegalStateException ex, WebRequest request) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", LocalDateTime.now());
    body.put("status", HttpStatus.CONFLICT.value());
    body.put("error", "Business Rule Violation");
    body.put("message", ex.getMessage());
    body.put("path", request.getDescription(false).replace("uri=", ""));

    return new ResponseEntity<>(body, HttpStatus.CONFLICT);
  }

  // New exception handlers for UserService
  @ExceptionHandler(UsernameNotFoundException.class)
  public ResponseEntity<Object> handleUsernameNotFoundException(UsernameNotFoundException ex, WebRequest request) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", LocalDateTime.now());
    body.put("status", HttpStatus.NOT_FOUND.value());
    body.put("error", "User Not Found");
    body.put("message", ex.getMessage());
    body.put("path", request.getDescription(false).replace("uri=", ""));

    return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<Object> handleDataIntegrityViolationException(DataIntegrityViolationException ex, WebRequest request) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", LocalDateTime.now());
    body.put("status", HttpStatus.CONFLICT.value());
    body.put("error", "Data Integrity Violation");
    body.put("message", "Database constraint violation. Possible duplicate entry or invalid reference.");
    body.put("path", request.getDescription(false).replace("uri=", ""));

    return new ResponseEntity<>(body, HttpStatus.CONFLICT);
  }

  // New exception handlers for WatchlistService
  @ExceptionHandler(WatchlistOperationException.class)
  public ResponseEntity<Object> handleWatchlistOperationException(WatchlistOperationException ex, WebRequest request) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", LocalDateTime.now());
    body.put("status", HttpStatus.BAD_REQUEST.value());
    body.put("error", "Watchlist Operation Failed");
    body.put("message", ex.getMessage());
    body.put("path", request.getDescription(false).replace("uri=", ""));

    return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
  }
}