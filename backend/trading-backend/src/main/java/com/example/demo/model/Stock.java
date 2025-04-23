package com.example.demo.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@IdClass(StockId.class)
@Table(name = "stocks")
public class Stock implements Serializable {

    @Id
    @Column(name = "symbol", nullable = false)
    private String symbol;

    @Id
    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "open_price", nullable = false)
    private double openPrice;

    @Column(name = "high_price", nullable = false)
    private double highPrice;

    @Column(name = "low_price", nullable = false)
    private double lowPrice;

    @Column(name = "close_price", nullable = false)
    private double closePrice;

    @Column(name = "volume", nullable = false)
    private long volume;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    // Constructors
    public Stock() {}

    public Stock(String symbol, LocalDate date, double openPrice, double highPrice,
                 double lowPrice, double closePrice, long volume, LocalDateTime timestamp) {
        this.symbol = symbol;
        this.date = date;
        this.openPrice = openPrice;
        this.highPrice = highPrice;
        this.lowPrice = lowPrice;
        this.closePrice = closePrice;
        this.volume = volume;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public double getOpenPrice() {
        return openPrice;
    }

    public void setOpenPrice(double openPrice) {
        this.openPrice = openPrice;
    }

    public double getHighPrice() {
        return highPrice;
    }

    public void setHighPrice(double highPrice) {
        this.highPrice = highPrice;
    }

    public double getLowPrice() {
        return lowPrice;
    }

    public void setLowPrice(double lowPrice) {
        this.lowPrice = lowPrice;
    }

    public double getClosePrice() {
        return closePrice;
    }

    public void setClosePrice(double closePrice) {
        this.closePrice = closePrice;
    }

    public long getVolume() {
        return volume;
    }

    public void setVolume(long volume) {
        this.volume = volume;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
