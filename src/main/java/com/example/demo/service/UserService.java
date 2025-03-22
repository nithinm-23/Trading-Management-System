package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
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
        if (userRepository.findByEmail(newUser.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists!");
        }
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword())); // Encrypt password
        return userRepository.save(newUser);
    }

    public User loginUser(String email, String password) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            if (passwordEncoder.matches(password, user.getPassword())) { // Password validation
                return user;
            } else {
                throw new RuntimeException("Invalid password!");
            }
        } else {
            throw new RuntimeException("User not found!");
        }
    }

    public User updateUser(Long id, User updatedUser) {
        return userRepository.findById(id).map(existingUser -> {
            existingUser.setEmail(updatedUser.getEmail());
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
            return userRepository.save(existingUser);
        }).orElse(null);
    }

    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Add balance to user
    public User addBalance(Long userId, Double amount) {
        return userRepository.findById(userId).map(user -> {
            user.setBalance(user.getBalance() + amount);
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found!"));
    }

    // Remove balance from user
    public User removeBalance(Long userId, Double amount) {
        return userRepository.findById(userId).map(user -> {
            if (user.getBalance() < amount) {
                throw new RuntimeException("Insufficient balance!");
            }
            user.setBalance(user.getBalance() - amount);
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found!"));
    }
}
