package com.example.demo.controller;

import com.example.demo.model.Transaction;
import com.example.demo.model.TransactionType;
import com.example.demo.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@PreAuthorize("hasRole('USER')")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping("/record")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> recordTransaction(@RequestBody TransactionRequest request) {
        try {
            Transaction transaction = transactionService.recordTransaction(
                    request.getUserId(),
                    request.getAmount(),
                    TransactionType.valueOf(request.getType().toUpperCase())
            );
            return ResponseEntity.ok(transaction);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('USER')")
    public List<Transaction> getTransactions(@PathVariable Long userId) {
        return transactionService.getTransactions(userId);
    }

    public static class TransactionRequest {
        private Long userId;
        private Double amount;
        private String type;

        // Getters and setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }
}