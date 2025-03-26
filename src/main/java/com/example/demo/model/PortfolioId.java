package com.example.demo.model;

import java.io.Serializable;
import java.util.Objects;

public class PortfolioId implements Serializable {
    private String tickerSymbol;
    private Long userId;

    public PortfolioId() {}

    public PortfolioId(String tickerSymbol, Long userId) {
        this.tickerSymbol = tickerSymbol;
        this.userId = userId;
    }

    // Getters, setters
    // equals() and hashCode() implementations
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PortfolioId that = (PortfolioId) o;
        return Objects.equals(tickerSymbol, that.tickerSymbol) &&
                Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(tickerSymbol, userId);
    }
}