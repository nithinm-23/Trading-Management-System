package com.example.demo.controller;

import com.example.demo.model.Trade;
import com.example.demo.model.TradeType;
import com.example.demo.service.TradeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/trades")
public class TradeController {

    private final TradeService tradeService;

    public TradeController(TradeService tradeService) {
        this.tradeService = tradeService;
    }

    @PostMapping("/execute")
    public ResponseEntity<Trade> executeTrade(
            @RequestParam Long userId,
            @RequestParam String tickerSymbol,
            @RequestParam TradeType tradeType,
            @RequestParam int quantity,
            @RequestParam BigDecimal tradePrice) {

        Trade executedTrade = tradeService.executeTrade(userId, tickerSymbol, tradeType, quantity, tradePrice);

        if (executedTrade == null) {
            return ResponseEntity.badRequest().build();  // Return 400 Bad Request if trade execution fails
        }

        return ResponseEntity.ok(executedTrade);
    }


    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Trade>> getUserTrades(@PathVariable Long userId) {
        return ResponseEntity.ok(tradeService.getTradesByUser(userId));
    }
}
