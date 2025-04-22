package com.example.demo.controller;

import com.example.demo.model.Portfolio;
import com.example.demo.service.PortfolioService;
import com.example.demo.service.StockService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final StockService stockService;

    public PortfolioController(PortfolioService portfolioService, StockService stockService) {
        this.portfolioService = portfolioService;
        this.stockService = stockService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Portfolio>> getUserPortfolio(@PathVariable Long userId) {
        List<Portfolio> portfolio = portfolioService.getPortfolioByUser(userId);
        // Enrich with current prices
        portfolio.forEach(item -> {
            Double currentPrice = stockService.getCurrentPrice(item.getSymbol());
            item.setCurrentPrice(currentPrice);
        });
        return ResponseEntity.ok(portfolio);
    }

    @PostMapping("/sell/{userId}/{symbol}")
    public ResponseEntity<?> sellStock(
            @PathVariable Long userId,
            @PathVariable String symbol,
            @RequestParam int quantity) {

        try {
            Portfolio updatedPortfolio = portfolioService.sellStock(userId, symbol, quantity);
            return ResponseEntity.ok(updatedPortfolio);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

}