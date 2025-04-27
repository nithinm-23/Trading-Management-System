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
import java.util.Arrays;
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

        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void recordTransaction_ShouldHandleNullInputs() {
        // Test null userId
        assertThrows(IllegalArgumentException.class, () ->
                transactionService.recordTransaction(null, amount, type));

        // Test null amount
        assertThrows(IllegalArgumentException.class, () ->
                transactionService.recordTransaction(userId, null, type));

        // Test null type
        assertThrows(IllegalArgumentException.class, () ->
                transactionService.recordTransaction(userId, amount, null));
    }

    @Test
    void recordTransaction_ShouldValidateAmount() {
        // Test zero amount
        assertThrows(IllegalArgumentException.class, () ->
                transactionService.recordTransaction(userId, 0.0, type));

        // Test negative amount
        assertThrows(IllegalArgumentException.class, () ->
                transactionService.recordTransaction(userId, -100.0, type));
    }

    @Test
    void getTransactions_ShouldReturnOrderedList() {
        // Arrange
        Transaction t1 = new Transaction(userId, 500.0, TransactionType.ADD);
        t1.setTimestamp(LocalDateTime.now().minusDays(1));

        Transaction t2 = new Transaction(userId, 200.0, TransactionType.WITHDRAW);
        t2.setTimestamp(LocalDateTime.now());

        List<Transaction> mockTransactions = Arrays.asList(t2, t1); // Already in descending order

        when(transactionRepository.findByUserIdOrderByTimestampDesc(userId))
                .thenReturn(mockTransactions);

        // Act
        List<Transaction> result = transactionService.getTransactions(userId);

        // Assert
        assertEquals(2, result.size());
        assertEquals(t2, result.get(0)); // Newest first
        assertEquals(t1, result.get(1)); // Older second
        verify(transactionRepository, times(1)).findByUserIdOrderByTimestampDesc(userId);
    }

    @Test
    void getTransactions_ShouldHandleEmptyResult() {
        when(transactionRepository.findByUserIdOrderByTimestampDesc(userId))
                .thenReturn(List.of());

        List<Transaction> result = transactionService.getTransactions(userId);

        assertTrue(result.isEmpty());
    }

    @Test
    void getTransactions_ShouldValidateUserId() {
        assertThrows(IllegalArgumentException.class, () ->
                transactionService.getTransactions(null));

        assertThrows(IllegalArgumentException.class, () ->
                transactionService.getTransactions(-1L));
    }
}