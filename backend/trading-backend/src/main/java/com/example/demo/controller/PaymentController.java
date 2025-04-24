    package com.example.demo.controller;

    import com.example.demo.dto.PaymentRequest;
    import com.example.demo.dto.PaymentResponse;
    import com.example.demo.model.SavedCard;
    import com.example.demo.service.PaymentService;
    import com.example.demo.service.SavedCardService;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;

    @RestController
    @RequestMapping("/api/payment")
    @CrossOrigin(origins = "*")
    public class PaymentController {

        @Autowired
        private PaymentService paymentService;

        @Autowired
        private SavedCardService savedCardService;

        @PostMapping("/process")
        public PaymentResponse processPayment(@RequestBody PaymentRequest request) {
            return paymentService.processCardPayment(request);
        }

        @PostMapping("/addCard")
        public String addCard(@RequestBody SavedCard savedCard) {
            // Encrypt the card details securely
            savedCardService.saveCard(savedCard);
            return "Card added successfully";
        }

        @DeleteMapping("/deleteCard/{cardId}")
        public ResponseEntity<String> deleteCard(@PathVariable Long cardId) {
            savedCardService.deleteCard(cardId);
            return ResponseEntity.ok("Card deleted successfully!");
        }

        // PaymentController.java
        @GetMapping("/cards/{userId}")
        public List<SavedCard> getUserCards(@PathVariable Long userId) {
            return savedCardService.getCardsByUserId(userId);
        }

    }
