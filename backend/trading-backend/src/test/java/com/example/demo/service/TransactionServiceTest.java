package com.example.demo.service;

import com.example.demo.model.Transaction;
import com.example.demo.model.TransactionType;
import com.example.demo.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private TransactionService transactionService;

    private final Long userId = 1L;
    private final Double amount = 1000.0;
    private final TransactionType type = TransactionType.ADD;

    @Test
    void recordTransaction_ShouldSaveAndReturnTransaction() {
        // Arrange
        Transaction mockTransaction = new Transaction(userId, amount, type);
        mockTransaction.setId(1L);
        mockTransaction.setTimestamp(LocalDateTime.now());

        when(transactionRepository.save(any(Transaction.class))).thenReturn(mockTransaction);

        // Act
        Transaction result = transactionService.recordTransaction(userId, amount, type);

        // Assert
        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertEquals(amount, result.getAmount());
        assertEquals(type, result.getType());
        assertNotNull(result.getTimestamp());
        assertTrue(ChronoUnit.SECONDS.between(LocalDateTime.now(), result.getTimestamp()) <= 1); // timestamp reasonable

        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void recordTransaction_ShouldHandleNullInputs() {
        // Test null userId
        Exception e1 = assertThrows(IllegalArgumentException.class, () -> transactionService.recordTransaction(null, amount, type));
        assertEquals("User ID cannot be null.", e1.getMessage());

        // Test null amount
        Exception e2 = assertThrows(IllegalArgumentException.class, () -> transactionService.recordTransaction(userId, null, type));
        assertEquals("Amount cannot be null.", e2.getMessage());

        // Test null type
        Exception e3 = assertThrows(IllegalArgumentException.class, () -> transactionService.recordTransaction(userId, amount, null));
        assertEquals("Transaction type cannot be null.", e3.getMessage());
    }

    @Test
    void recordTransaction_ShouldValidateAmount() {
        // Test zero amount
        Exception e1 = assertThrows(IllegalArgumentException.class, () -> transactionService.recordTransaction(userId, 0.0, type));
        assertEquals("Amount must be greater than 0.", e1.getMessage());

        // Test negative amount
        Exception e2 = assertThrows(IllegalArgumentException.class, () -> transactionService.recordTransaction(userId, -500.0, type));
        assertEquals("Amount must be greater than 0.", e2.getMessage());
    }

    @Test
    void recordTransaction_ShouldHandleRepositoryException() {
        when(transactionRepository.save(any(Transaction.class))).thenThrow(new RuntimeException("Database error"));

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                transactionService.recordTransaction(userId, amount, type)
        );

        assertEquals("Database error", exception.getMessage());
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void getTransactions_ShouldReturnOrderedList() {
        // Arrange
        Transaction t1 = new Transaction(userId, 500.0, TransactionType.ADD);
        t1.setTimestamp(LocalDateTime.now().minusDays(1));

        Transaction t2 = new Transaction(userId, 200.0, TransactionType.WITHDRAW);
        t2.setTimestamp(LocalDateTime.now());

        List<Transaction> mockTransactions = Arrays.asList(t2, t1); // Descending order

        when(transactionRepository.findByUserIdOrderByTimestampDesc(userId)).thenReturn(mockTransactions);

        // Act
        List<Transaction> result = transactionService.getTransactions(userId);

        // Assert
        assertEquals(2, result.size());
        assertSame(t2, result.get(0));
        assertSame(t1, result.get(1));

        verify(transactionRepository, times(1)).findByUserIdOrderByTimestampDesc(userId);
    }

    @Test
    void getTransactions_ShouldHandleEmptyResult() {
        when(transactionRepository.findByUserIdOrderByTimestampDesc(userId)).thenReturn(Collections.emptyList());

        List<Transaction> result = transactionService.getTransactions(userId);

        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(transactionRepository, times(1)).findByUserIdOrderByTimestampDesc(userId);
    }

    @Test
    void getTransactions_ShouldValidateUserId() {
        Exception e1 = assertThrows(IllegalArgumentException.class, () -> transactionService.getTransactions(null));
        assertEquals("User ID must be valid.", e1.getMessage());

        Exception e2 = assertThrows(IllegalArgumentException.class, () -> transactionService.getTransactions(-10L));
        assertEquals("User ID must be valid.", e2.getMessage());
    }

    @Test
    void getTransactions_ShouldHandleRepositoryException() {
        when(transactionRepository.findByUserIdOrderByTimestampDesc(userId))
                .thenThrow(new RuntimeException("Database down"));

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                transactionService.getTransactions(userId)
        );

        assertEquals("Database down", exception.getMessage());
        verify(transactionRepository, times(1)).findByUserIdOrderByTimestampDesc(userId);
    }
}
