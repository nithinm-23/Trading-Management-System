package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.service.TradeService;
import com.example.demo.service.StockService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/trades")
@PreAuthorize("hasRole('USER')")
public class TradeController {

    private final TradeService tradeService;
    private final StockService stockService;

    public TradeController(TradeService tradeService, StockService stockService) {
        this.tradeService = tradeService;
        this.stockService = stockService;
    }

    @PostMapping("/buy")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> buyStock(
            @RequestParam Long userId,
            @RequestParam String symbol,
            @RequestParam int quantity) {

        try {
            double currentPrice = stockService.getCurrentPrice(symbol);
            Trade trade = tradeService.executeTrade(userId, symbol, TradeType.BUY, quantity, currentPrice);
            return ResponseEntity.ok(trade);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "error", "Buy trade failed",
                            "message", e.getMessage()
                    )
            );
        }
    }

    @PostMapping("/sell")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> sellStock(
            @RequestParam Long userId,
            @RequestParam String symbol,
            @RequestParam int quantity) {

        try {
            double currentPrice = stockService.getCurrentPrice(symbol);
            Trade trade = tradeService.executeTrade(userId, symbol, TradeType.SELL, quantity, currentPrice);
            return ResponseEntity.ok(trade);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "error", "Sell trade failed",
                            "message", e.getMessage()
                    )
            );
        }
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getUserTrades(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(tradeService.getUserTrades(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "error", "Failed to fetch trades",
                            "message", e.getMessage()
                    )
            );
        }
    }

    @GetMapping("/user/{userId}/stock/{symbol}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getUserTradesForStock(
            @PathVariable Long userId,
            @PathVariable String symbol) {
        try {
            return ResponseEntity.ok(tradeService.getUserTradesForStock(userId, symbol));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "error", "Failed to fetch trades",
                            "message", e.getMessage()
                    )
            );
        }
    }

}