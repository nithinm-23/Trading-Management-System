package com.example.demo.service;

import com.example.demo.dto.PaymentRequest;
import com.example.demo.dto.PaymentResponse;
import com.example.demo.model.Transaction;
import com.example.demo.model.TransactionType;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    public PaymentResponse processPayment(PaymentRequest request) {
        String transactionId = UUID.randomUUID().toString();
        boolean isSuccess = true;
        String status = isSuccess ? "SUCCESS" : "FAILURE";

        TransactionType type = null;
        try {
            type = TransactionType.valueOf(request.getType());
        } catch (IllegalArgumentException | NullPointerException e) {
            return new PaymentResponse(transactionId, "FAILURE", "Invalid transaction type");
        }

        Transaction transaction = new Transaction();
        transaction.setUserId(request.getUserId());
        transaction.setAmount(request.getAmount());
        transaction.setType(type);
        transaction.setTransactionId(transactionId);
        transaction.setStatus(status);

        transactionRepository.save(transaction);

        if (isSuccess) {
            Optional<User> userOpt = userRepository.findById(request.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (type == TransactionType.ADD) {
                    user.setBalance(user.getBalance() + request.getAmount());
                } else if (type == TransactionType.WITHDRAW) {
                    user.setBalance(user.getBalance() - request.getAmount());
                }
                userRepository.save(user);
            }
        }

        return new PaymentResponse(transactionId, status, isSuccess ? "Payment successful" : "Payment failed");
    }
}
