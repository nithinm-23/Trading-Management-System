package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "watchlist_stock")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WatchlistStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "watchlist_id", nullable = false)
    @JsonIgnore
    private Watchlist watchlist;

    @ManyToOne
    @JoinColumns({
            @JoinColumn(name = "stock_symbol", referencedColumnName = "symbol"),
            @JoinColumn(name = "stock_date", referencedColumnName = "date")
    })
    private Stock stock;

    public WatchlistStock(Watchlist watchlist, Stock stock) {
        this.watchlist = watchlist;
        this.stock = stock;
    }

    public String getStockSymbol() {
        return (stock != null) ? stock.getSymbol() : null;
    }
}
