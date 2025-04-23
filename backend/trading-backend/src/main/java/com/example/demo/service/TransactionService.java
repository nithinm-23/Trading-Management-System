package com.example.demo.service;

import com.example.demo.model.Transaction;
import com.example.demo.model.TransactionType;
import com.example.demo.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public Transaction recordTransaction(Long userId, Double amount, TransactionType type) {
        Transaction transaction = new Transaction(userId, amount, type);
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getTransactions(Long userId) {
        return transactionRepository.findByUserIdOrderByTimestampDesc(userId);
    }
}
