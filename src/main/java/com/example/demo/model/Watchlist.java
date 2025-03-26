package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Watchlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;  // Name of the watchlist

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;  // Each watchlist belongs to a user

    @OneToMany(mappedBy = "watchlist", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<WatchlistStock> stocks = new HashSet<>();  // Stocks in this watchlist

    // Constructors
    public Watchlist() {}

    public Watchlist(String name, User user) {
        this.name = name;
        this.user = user;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Set<WatchlistStock> getStocks() { return stocks; }
    public void setStocks(Set<WatchlistStock> stocks) { this.stocks = stocks; }
}
