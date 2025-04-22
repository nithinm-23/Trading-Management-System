package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    @Email(message = "Email should be valid")
    private String email;

    @Column(nullable = true, length = 72)
    private String password;

    @Column(nullable = false)
    @NotBlank(message = "Name is required")
    private String name;

    @Column(nullable = false)
    private String provider;

    @Column(unique = true, nullable = true, length = 10)
    @Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]{1}$", message = "Invalid PAN format")
    private String panNumber;

    @Column(unique = true, nullable = true, length = 10)
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian mobile number")
    private String mobileNumber;

    @Column(nullable = true)
    private String gender;

    @Column(nullable = true)
    private String dob; // Stored as String in format "yyyy-MM-dd"

    @Column(name = "balance", nullable = false, columnDefinition = "double default 0.0")
    private double balance = 0.0;

    @Column(nullable = false)
    private Boolean verified = false;

    @Column(nullable = false)
    private boolean profileCompleted = false;

    @Column(nullable =false)
    private boolean mobileVerified;

    @Column(name = "email_verified")
    private boolean emailVerified = false;


    public User() {}

    public User(String email, String password, String name, String provider, double balance, String panNumber, String mobileNumber, String gender, String dob) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.provider = provider;
        this.balance = balance;
        this.panNumber = panNumber;
        this.mobileNumber = mobileNumber;
        this.gender = gender;
        this.dob = dob;
    }

    public boolean isProfileFullyCompleted() {
        return this.profileCompleted &&
                this.panNumber != null &&
                this.mobileNumber != null &&
                this.gender != null &&
                this.dob != null;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }


    public boolean isProfileCompleted() { return profileCompleted; }
    public void setProfileCompleted(boolean profileCompleted) {
        this.profileCompleted = profileCompleted;
    }

    public boolean isMobileVerified() {return mobileVerified;}
    public void setMobileVerified(boolean mobileVerified) {
        this.mobileVerified = mobileVerified;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

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

    public Boolean getVerified() { return verified; }
    public void setVerified(Boolean verified) { this.verified = verified; }

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<Watchlist> watchlists = new HashSet<>();

    public Set<Watchlist> getWatchlists() { return watchlists; }
    public void setWatchlists(Set<Watchlist> watchlists) { this.watchlists = watchlists; }
}