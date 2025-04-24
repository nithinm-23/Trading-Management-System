package com.example.demo.repository;

import com.example.demo.model.SavedCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedCardRepository extends JpaRepository<SavedCard, Long> {
    List<SavedCard> findByUserId(Long userId);
    Optional<SavedCard> findByCardNumberAndExpiryMonthAndExpiryYear(String cardNumber, int expiryMonth, int expiryYear);
    boolean existsByCardNumber(String cardNumber);
}
