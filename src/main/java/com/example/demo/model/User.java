package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false, length = 10)
    private String panNumber;  // New field for PAN

    @Column(unique = true, nullable = false, length = 10)
    private String mobileNumber; // New field for Mobile

    @Column(nullable = false)
    private String gender; // New field for Gender

    @Column(nullable = false)
    private String dob; // New field for Date of Birth (YYYY-MM-DD format)

    @Column(name = "balance", nullable = false, columnDefinition = "double default 0.0")
    private double balance = 0.0;

    public User() {}

    public User(String email, String password, Double balance, String panNumber, String mobileNumber, String gender, String dob) {
        this.email = email;
        this.password = password;
        this.balance = balance;
        this.panNumber = panNumber;
        this.mobileNumber = mobileNumber;
        this.gender = gender;
        this.dob = dob;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Double getBalance() { return balance; }
    public void setBalance(Double balance) { this.balance = balance; }

    public String getPanNumber() { return panNumber; }
    public void setPanNumber(String panNumber) { this.panNumber = panNumber; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<Watchlist> watchlists = new HashSet<>();

    public Set<Watchlist> getWatchlists() { return watchlists; }
    public void setWatchlists(Set<Watchlist> watchlists) { this.watchlists = watchlists; }
}
