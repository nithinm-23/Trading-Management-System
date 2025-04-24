package com.example.demo.service;

import com.example.demo.model.SavedCard;
import com.example.demo.repository.SavedCardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SavedCardService {

    @Autowired
    private SavedCardRepository savedCardRepository;

    // Main method to save encrypted card with detected type
    public SavedCard saveCard(SavedCard card) {

        if (savedCardRepository.existsByCardNumber(card.getCardNumber())) {
            throw new IllegalArgumentException("Card already exists in the system.");
        }

        // Encrypt sensitive data
        String encryptedCardNumber = encryptCardNumber(card.getCardNumber());
        String encryptedCvv = encryptCvv(card.getCvv());
        card.setCardNumber(encryptedCardNumber);
        card.setCvv(encryptedCvv);

        // Detect and set card type if not provided
        if (card.getCardType() == null || card.getCardType().isEmpty()) {
            card.setCardType(detectCardType(card.getCardNumber()));
        }

        return savedCardRepository.save(card);
    }

    // Fetch all saved cards for a user
    public List<SavedCard> getCardsByUserId(Long userId) {
        return savedCardRepository.findByUserId(userId);
    }

    // Delete card by cardId
    public void deleteCard(Long cardId) {
        savedCardRepository.deleteById(cardId);
    }

    // Mock encryption for card number (Replace with real encryption logic in production)
    private String encryptCardNumber(String cardNumber) {
        return cardNumber; // TODO: Add real encryption
    }

    // Mock encryption for CVV
    private String encryptCvv(String cvv) {
        return cvv; // TODO: Add real encryption
    }

    // Card type detection logic
    private String detectCardType(String cardNumber) {
        if (cardNumber == null || cardNumber.isEmpty()) {
            return "Unknown";
        }

        if (cardNumber.matches("^4\\d*")) {
            return "Visa";
        } else if (cardNumber.matches("^5[1-5]\\d*")) {
            return "MasterCard";
        } else if (cardNumber.matches("^(508[5-9]|6069|607|608|6521|6522).*")) {
            return "Rupay";
        } else if (cardNumber.matches("^3\\d*")) {
            return "American Express";
        } else if (cardNumber.matches("^6\\d*")) {
            return "Discover";
        } else {
            return "Unknown";
        }
    }

}
