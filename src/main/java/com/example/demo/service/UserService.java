package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
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
        return userRepository.save(newUser);
    }

    public User loginUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found!"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid password!");
        }
        return user;
    }

    public User updateUser(Long id, User updatedUser) {
        return userRepository.findById(id).map(existingUser -> {
            if (updatedUser.getEmail() != null) {
                existingUser.setEmail(updatedUser.getEmail());
            }
            if (updatedUser.getPassword() != null) {
                existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
            }
            if (updatedUser.getPanNumber() != null) {
                existingUser.setPanNumber(updatedUser.getPanNumber());
            }
            if (updatedUser.getMobileNumber() != null) {
                existingUser.setMobileNumber(updatedUser.getMobileNumber());
            }
            return userRepository.save(existingUser);
        }).orElseThrow(() -> new IllegalArgumentException("User not found!"));
    }

//    public void deleteUser(Long id) {
//        if (!userRepository.existsById(id)) {
//            throw new IllegalArgumentException("User not found!");
//        }
//        userRepository.deleteById(id);
//    }

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

}
