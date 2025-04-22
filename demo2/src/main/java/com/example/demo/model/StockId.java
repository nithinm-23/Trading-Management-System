package com.example.demo.model;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

@Embeddable
public class StockId implements Serializable {
    private String symbol;
    private LocalDate date;

    public StockId() {}

    public StockId(String symbol, LocalDate date) {
        this.symbol = symbol;
        this.date = date;
    }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StockId stockId = (StockId) o;
        return Objects.equals(symbol, stockId.symbol) &&
                Objects.equals(date, stockId.date);
    }

    @Override
    public int hashCode() {
        return Objects.hash(symbol, date);
    }
}
