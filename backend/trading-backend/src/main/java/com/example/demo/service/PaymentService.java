package com.example.demo.service;

import com.example.demo.dto.PaymentRequest;
import com.example.demo.dto.PaymentResponse;
import com.example.demo.model.SavedCard;
import com.example.demo.model.Transaction;
import com.example.demo.model.TransactionType;
import com.example.demo.repository.SavedCardRepository;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SavedCardRepository savedCardRepository;


//    public PaymentResponse processPayment(PaymentRequest request) {
//        String transactionId = UUID.randomUUID().toString();
//        boolean isSuccess = true;
//        String status = isSuccess ? "SUCCESS" : "FAILURE";
//
//        TransactionType type = null;
//        try {
//            type = TransactionType.valueOf(request.getType());
//        } catch (IllegalArgumentException | NullPointerException e) {
//            return new PaymentResponse(transactionId, "FAILURE", "Invalid transaction type");
//        }
//
//        Transaction transaction = new Transaction();
//        transaction.setUserId(request.getUserId());
//        transaction.setAmount(request.getAmount());
//        transaction.setType(type);
//        transaction.setTransactionId(transactionId);
//        transaction.setStatus(status);
//
//        transactionRepository.save(transaction);
//
//        if (isSuccess) {
//            Optional<User> userOpt = userRepository.findById(request.getUserId());
//            if (userOpt.isPresent()) {
//                User user = userOpt.get();
//                if (type == TransactionType.ADD) {
//                    user.setBalance(user.getBalance() + request.getAmount());
//                } else if (type == TransactionType.WITHDRAW) {
//                    user.setBalance(user.getBalance() - request.getAmount());
//                }
//                userRepository.save(user);
//            }
//        }
//
//        return new PaymentResponse(transactionId, status, isSuccess ? "Payment successful" : "Payment failed");
//    }

    public PaymentResponse processCardPayment(PaymentRequest request) {
        String transactionId = UUID.randomUUID().toString();

        // Step 1: Validate transaction type
        TransactionType type;
        try {
            type = TransactionType.valueOf(request.getType());
        } catch (IllegalArgumentException | NullPointerException e) {
            return new PaymentResponse(transactionId, "FAILURE", "Invalid transaction type");
        }

        // Step 2: Validate card against saved cards
        Optional<SavedCard> savedCardOpt = savedCardRepository.findByCardNumberAndExpiryMonthAndExpiryYear(
                request.getCardNumber(), request.getExpiryMonth(), request.getExpiryYear());

        if (savedCardOpt.isEmpty()) {
            return new PaymentResponse(transactionId, "FAILURE", "Card not registered");
        }

        SavedCard savedCard = savedCardOpt.get();

        // Match user ID
        if (!savedCard.getUserId().equals(request.getUserId())) {
            return new PaymentResponse(transactionId, "FAILURE", "Card does not belong to this user");
        }

        // Expiry check
        if (!isValidExpiryDate(savedCard.getExpiryMonth(), savedCard.getExpiryYear())) {
            return new PaymentResponse(transactionId, "FAILURE", "Card has expired");
        }

        // Step 3: Save card if new and requested
        if (request.isSaveCard()) {
            boolean alreadyExists = savedCardRepository.existsByCardNumber(request.getCardNumber());
            if (!alreadyExists) {
                SavedCard newCard = new SavedCard();
                newCard.setUserId(request.getUserId());
                newCard.setCardNumber(request.getCardNumber());
                newCard.setExpiryMonth(request.getExpiryMonth());
                newCard.setExpiryYear(request.getExpiryYear());
                newCard.setCardHolderName(request.getCardHolderName());
                newCard.setCardType(request.getCardType());
                savedCardRepository.save(newCard);
            }
        }

        // Step 4: Create transaction
        Transaction transaction = new Transaction();
        transaction.setUserId(request.getUserId());
        transaction.setAmount(request.getAmount());
        transaction.setType(type);
        transaction.setTransactionId(transactionId);
        transaction.setStatus("SUCCESS");
        transactionRepository.save(transaction);

        // Step 5: Update balance
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

        return new PaymentResponse(transactionId, "SUCCESS", "Payment successful using registered card");
    }

    private boolean isValidExpiryDate(int month, int year) {
        YearMonth now = YearMonth.now();
        YearMonth expiry = YearMonth.of(year, month);
        return !expiry.isBefore(now) && expiry.isBefore(now.plusYears(10));
    }


}
