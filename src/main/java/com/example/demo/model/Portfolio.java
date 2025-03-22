package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "portfolio")
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @ManyToOne
    @JoinColumns({
            @JoinColumn(name = "stock_symbol", referencedColumnName = "symbol"),
            @JoinColumn(name = "stock_date", referencedColumnName = "date")
    })
    private Stock stock;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "purchase_price", nullable = false)
    private double purchasePrice;

    public Portfolio() {}

    public Portfolio(Stock stock, int quantity, double purchasePrice) {
        this.stock = stock;
        this.quantity = quantity;
        this.purchasePrice = purchasePrice;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Stock getStock() {
        return stock;
    }

    public void setStock(Stock stock) {
        this.stock = stock;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(double purchasePrice) {
        this.purchasePrice = purchasePrice;
    }
}
