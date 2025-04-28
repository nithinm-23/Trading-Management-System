package com.example.demo.service;

import com.example.demo.model.SavedCard;
import com.example.demo.repository.SavedCardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SavedCardServiceTest {

    private SavedCardRepository savedCardRepository;
    private SavedCardService savedCardService;

    @BeforeEach
    void setUp() {
        savedCardRepository = mock(SavedCardRepository.class);
        savedCardService = new SavedCardService();
        // Inject mock repository manually since field is private
        savedCardService = injectRepository(savedCardService, savedCardRepository);
    }

    @Test
    void saveCard_ShouldSave_WhenCardIsNew() {
        // Arrange
        SavedCard card = new SavedCard();
        card.setCardNumber("4111111111111111");
        card.setCvv("123");

        when(savedCardRepository.existsByCardNumber(anyString())).thenReturn(false);
        when(savedCardRepository.save(any(SavedCard.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        SavedCard savedCard = savedCardService.saveCard(card);

        // Assert
        assertNotNull(savedCard);
        assertEquals("Visa", savedCard.getCardType());
        verify(savedCardRepository, times(1)).existsByCardNumber(anyString());
        verify(savedCardRepository, times(1)).save(any(SavedCard.class));
    }

    @Test
    void saveCard_ShouldThrowException_WhenCardAlreadyExists() {
        // Arrange
        SavedCard card = new SavedCard();
        card.setCardNumber("4111111111111111");

        when(savedCardRepository.existsByCardNumber(anyString())).thenReturn(true);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> savedCardService.saveCard(card)
        );

        assertEquals("Card already exists in the system.", exception.getMessage());
        verify(savedCardRepository, times(1)).existsByCardNumber(anyString());
        verify(savedCardRepository, never()).save(any(SavedCard.class));
    }

    @Test
    void getCardsByUserId_ShouldReturnCards() {
        // Arrange
        Long userId = 1L;
        SavedCard card = new SavedCard();
        card.setUserId(userId);

        when(savedCardRepository.findByUserId(userId)).thenReturn(Collections.singletonList(card));

        // Act
        List<SavedCard> cards = savedCardService.getCardsByUserId(userId);

        // Assert
        assertNotNull(cards);
        assertEquals(1, cards.size());
        assertEquals(userId, cards.get(0).getUserId());
        verify(savedCardRepository, times(1)).findByUserId(userId);
    }

    @Test
    void deleteCard_ShouldDeleteCard() {
        // Arrange
        Long cardId = 10L;

        // Act
        savedCardService.deleteCard(cardId);

        // Assert
        verify(savedCardRepository, times(1)).deleteById(cardId);
    }

    @Test
    void detectCardType_ShouldReturnVisa() {
        String cardNumber = "4111111111111111";
        String result = callDetectCardType(cardNumber);
        assertEquals("Visa", result);
    }

    @Test
    void detectCardType_ShouldReturnMasterCard() {
        String cardNumber = "5111111111111111";
        String result = callDetectCardType(cardNumber);
        assertEquals("MasterCard", result);
    }

    @Test
    void detectCardType_ShouldReturnRupay() {
        String cardNumber = "5085111111111111";
        String result = callDetectCardType(cardNumber);
        assertEquals("Rupay", result);
    }

    @Test
    void detectCardType_ShouldReturnAmericanExpress() {
        String cardNumber = "371111111111111";
        String result = callDetectCardType(cardNumber);
        assertEquals("American Express", result);
    }

    @Test
    void detectCardType_ShouldReturnDiscover() {
        String cardNumber = "6011111111111111";
        String result = callDetectCardType(cardNumber);
        assertEquals("Discover", result);
    }

    @Test
    void detectCardType_ShouldReturnUnknown_WhenEmptyOrUnknown() {
        assertEquals("Unknown", callDetectCardType(null));
        assertEquals("Unknown", callDetectCardType(""));
        assertEquals("Unknown", callDetectCardType("9999999999999"));
    }

    // ===========================
    // Helper methods to call private methods
    // ===========================

    private SavedCardService injectRepository(SavedCardService service, SavedCardRepository repo) {
        try {
            var field = SavedCardService.class.getDeclaredField("savedCardRepository");
            field.setAccessible(true);
            field.set(service, repo);
            return service;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private String callDetectCardType(String cardNumber) {
        try {
            var method = SavedCardService.class.getDeclaredMethod("detectCardType", String.class);
            method.setAccessible(true);
            return (String) method.invoke(savedCardService, cardNumber);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
