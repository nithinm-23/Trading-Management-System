package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class PortfolioId implements Serializable {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "ticker_symbol")
    private String tickerSymbol;

    public PortfolioId() {}

    public PortfolioId(Long userId, String tickerSymbol) {
        this.userId = userId;
        this.tickerSymbol = tickerSymbol;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTickerSymbol() {
        return tickerSymbol;
    }

    public void setTickerSymbol(String tickerSymbol) {
        this.tickerSymbol = tickerSymbol;
    }

    // equals() and hashCode() are required for @Embeddable primary keys
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PortfolioId that = (PortfolioId) o;
        return Objects.equals(userId, that.userId) &&
                Objects.equals(tickerSymbol, that.tickerSymbol);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, tickerSymbol);
    }
}
