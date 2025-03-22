package com.example.demo.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // Ensure this field exists
    private String tickerSymbol; // Ensure this field exists
    private TradeType tradeType; // Ensure this field exists
    private int quantity;
    private BigDecimal tradePrice;
    private LocalDateTime tradeDate;

    // ✅ Default constructor (needed for Hibernate)
    public Trade() {}

    // ✅ Constructor for manual instantiation
    public Trade(Long userId, String tickerSymbol, TradeType tradeType, int quantity, BigDecimal tradePrice, LocalDateTime tradeDate) {
        this.userId = userId;
        this.tickerSymbol = tickerSymbol;
        this.tradeType = tradeType;
        this.quantity = quantity;
        this.tradePrice = tradePrice;
        this.tradeDate = tradeDate;
    }

    // ✅ Getter and Setter methods
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getTickerSymbol() { return tickerSymbol; }
    public void setTickerSymbol(String tickerSymbol) { this.tickerSymbol = tickerSymbol; }

    public TradeType getTradeType() { return tradeType; }
    public void setTradeType(TradeType tradeType) { this.tradeType = tradeType; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public BigDecimal getTradePrice() { return tradePrice; }
    public void setTradePrice(BigDecimal tradePrice) { this.tradePrice = tradePrice; }

    public LocalDateTime getTradeDate() { return tradeDate; }
    public void setTradeDate(LocalDateTime tradeDate) { this.tradeDate = tradeDate; }
}
