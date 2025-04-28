package com.example.demo.service;

import com.example.demo.dto.ProfileRequest;
import com.example.demo.dto.UserRegistrationDto;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.UserPrincipal;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.json.jackson2.JacksonFactory;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import static com.example.demo.service.TradeService.logger;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    private static final String CLIENT_ID = "366788596555-tkpo870btmcs2ktdehm172s3fppu5m4p.apps.googleusercontent.com";

    @Autowired
    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User newUser) {
        if (userRepository.existsByEmail(newUser.getEmail())) {
            throw new IllegalArgumentException("Email already exists!");
        }
        if (userRepository.existsByPanNumber(newUser.getPanNumber())) {
            throw new IllegalArgumentException("PAN number already registered!");
        }
        if (userRepository.existsByMobileNumber(newUser.getMobileNumber())) {
            throw new IllegalArgumentException("Mobile number already registered!");
        }



        newUser.setPassword(passwordEncoder.encode(newUser.getPassword())); // Encrypt password
        newUser.setProfileCompleted(true); // Set profile as completed
        return userRepository.save(newUser);
    }



    public User loginUser(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found!"));

        // Handle Google-authenticated users
        if ("google".equals(user.getProvider()) && user.getPassword()==null) {
            throw new IllegalArgumentException("Please login with Google");
        }

        // Handle users without passwords
        if (user.getPassword() == null) {
            throw new IllegalArgumentException("No password set for this account");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid password!");
        }

        return user;
    }

    public User updateUser(Long id, User updatedUser) {
        return userRepository.findById(id).map(existingUser -> {
            if (updatedUser.getName() != null) {
                existingUser.setName(updatedUser.getName());
            }
            if (updatedUser.getEmail() != null) {
                existingUser.setEmail(updatedUser.getEmail());
            }
            if (updatedUser.getMobileNumber() != null) {
                existingUser.setMobileNumber(updatedUser.getMobileNumber());
            }
            if (updatedUser.getPanNumber() != null) {
                existingUser.setPanNumber(updatedUser.getPanNumber());
            }
            if (updatedUser.getGender() != null) {
                existingUser.setGender(updatedUser.getGender());
            }
            if (updatedUser.getDob() != null) {
                existingUser.setDob(updatedUser.getDob());
            }


            if ("google".equals(existingUser.getProvider())) {
                boolean isComplete = existingUser.getPanNumber() != null &&
                        existingUser.getDob() != null &&
                        existingUser.getGender() != null &&
                        existingUser.getMobileNumber() != null;
                existingUser.setProfileCompleted(isComplete);
            }
            return userRepository.save(existingUser);
        }).orElseThrow(() -> new IllegalArgumentException("User not found!"));
    }

    public User addBalance(Long userId, Double amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Invalid amount!");
        }

        return userRepository.findById(userId).map(user -> {
            user.setBalance(user.getBalance() + amount);
            return userRepository.save(user);
        }).orElseThrow(() -> new IllegalArgumentException("User not found!"));
    }

    public User withdrawBalance(Long userId, Double amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Invalid amount!");
        }

        return userRepository.findById(userId).map(user -> {
            if (user.getBalance() < amount) {
                throw new IllegalArgumentException("Insufficient balance!");
            }
            user.setBalance(user.getBalance() - amount);
            return userRepository.save(user);
        }).orElseThrow(() -> new IllegalArgumentException("User not found!"));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found!"));
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean existsByPanNumber(String panNumber) {
        return userRepository.existsByPanNumber(panNumber);
    }

    public boolean existsByMobileNumber(String mobileNumber) {
        return userRepository.existsByMobileNumber(mobileNumber);
    }

    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public boolean changePassword(Long userId, String oldPassword, String newPassword) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // Check if old password matches
            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                return false; // Incorrect old password
            }

            // Update with new hashed password
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public User updatePartialUser(Long id, Map<String, Object> updates) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            if (updates.containsKey("email")) {
                user.setEmail((String) updates.get("email"));
            }
            if (updates.containsKey("mobileNumber")) {
                user.setMobileNumber((String) updates.get("mobileNumber"));
            }

            return userRepository.save(user);
        }
        return null;
    }

    // Add to your existing UserService class

    @Transactional
    public void deductFunds(Long userId, double amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getBalance() < amount) {
            throw new RuntimeException("Insufficient funds");
        }

        user.setBalance(user.getBalance() - amount);
        userRepository.save(user);
    }

    @Transactional
    public void addFunds(Long userId, double amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setBalance(user.getBalance() + amount);
        userRepository.save(user);
    }

    public double getBalance(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getBalance();
    }

    @Transactional
    public User processGoogleUser(String idToken, String name) {
        try {
            // Verify Google token
            String email = verifyGoogleToken(idToken);
            logger.info("Verified Google token for email: {}", email);

            // Find or create user
            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setEmail(email);
                        newUser.setName(name);
                        newUser.setVerified(true);
                        newUser.setBalance(0.0);
                        newUser.setProvider("google");
                        newUser.setEmailVerified(true);
                        return userRepository.save(newUser);
                    });

            // Validate existing user
            if (user.getPassword() != null && !"google".equals(user.getProvider())) {
                throw new IllegalArgumentException("Email already registered with password");
            }

            // Only update name if it's null or blank (i.e., user never updated it)
            if ((user.getName() == null || user.getName().isBlank()) && name != null) {
                user.setName(name);
            }


            if (!"google".equals(user.getProvider())) {
                user.setProvider("google");
            }
            return userRepository.save(user);

        } catch (Exception e) {
            logger.error("Error processing Google user", e);
            throw new IllegalArgumentException("Google authentication failed: " + e.getMessage());
        }
    }

    private String verifyGoogleToken(String idToken) throws GeneralSecurityException, IOException {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier
                .Builder(GoogleNetHttpTransport.newTrustedTransport(), JacksonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(CLIENT_ID))
                .build();



        GoogleIdToken googleIdToken = verifier.verify(idToken);
        if (googleIdToken == null) {
            throw new IllegalArgumentException("Invalid Google token");
        }

        // Verify token expiration
        long now = System.currentTimeMillis() / 1000;
        if (googleIdToken.getPayload().getExpirationTimeSeconds() < now) {
            throw new IllegalArgumentException("Token expired");
        }

        return googleIdToken.getPayload().getEmail();
    }

    public boolean setPassword(Long userId, String newPassword) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // Only allow if user is a Google user without password
            if ("google".equals(user.getProvider())) {
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }

    public void completeUserProfile(String email, ProfileRequest updatedData) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("User not found.");
        }

        User existingUser = optionalUser.get();

        // Check for duplicate PAN or mobile (but ignore the current user's own values)
        if (updatedData.getPanNumber() != null &&
                !updatedData.getPanNumber().equals(existingUser.getPanNumber()) &&
                userRepository.existsByPanNumber(updatedData.getPanNumber())) {
            throw new IllegalArgumentException("PAN number already in use.");
        }

        if (updatedData.getMobileNumber() != null &&
                !updatedData.getMobileNumber().equals(existingUser.getMobileNumber()) &&
                userRepository.existsByMobileNumber(updatedData.getMobileNumber())) {
            throw new IllegalArgumentException("Mobile number already in use.");
        }

        existingUser.setName(updatedData.getName());
        existingUser.setDob(updatedData.getDob());
        existingUser.setGender(updatedData.getGender());
        existingUser.setMobileNumber(updatedData.getMobileNumber());
        existingUser.setPanNumber(updatedData.getPanNumber());
        existingUser.setProfileCompleted(true);

        if (updatedData.getPassword() != null && !updatedData.getPassword().isBlank()) {
            if (!updatedData.getPassword().equals(updatedData.getConfirmPassword())) {
                throw new IllegalArgumentException("Passwords do not match.");
            }

            // Only allow password set if user signed in with Google and has no password yet
            if ("google".equals(existingUser.getProvider()) && existingUser.getPassword() == null) {
                existingUser.setPassword(passwordEncoder.encode(updatedData.getPassword()));
            }
        }


        userRepository.save(existingUser);
    }

    public void markMobileAsVerified(String mobileNumber) {
        User user = userRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        user.setMobileVerified(true); // this updates the field
        userRepository.save(user); // this saves to DB
    }



}
