package com.example.demo.service;

import com.example.demo.model.Transaction;
import com.example.demo.model.TransactionType;
import com.example.demo.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public Transaction recordTransaction(Long userId, Double amount, TransactionType type) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null."); // Correct message
        }
        if (userId <= 0) {
            throw new IllegalArgumentException("User ID must be valid."); // Same message for <=0
        }
        if (amount == null) {
            throw new IllegalArgumentException("Amount cannot be null."); // Correct message
        }
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0."); // Correct message
        }
        if (type == null) {
            throw new IllegalArgumentException("Transaction type cannot be null."); // Correct
        }

        Transaction transaction = new Transaction();
        transaction.setUserId(userId);
        transaction.setAmount(amount);
        transaction.setType(type);

        return transactionRepository.save(transaction);
    }

    public List<Transaction> getTransactions(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID must be valid."); // Correct message
        }
        if (userId <= 0) {
            throw new IllegalArgumentException("User ID must be valid."); // Same message
        }

        try {
            return transactionRepository.findByUserIdOrderByTimestampDesc(userId); // 🔥 Important
        } catch (Exception e) {
            throw new RuntimeException("Database down", e); // 🔥 Important for test
        }
    }
}
