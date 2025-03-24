package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> userData) {
        String email = userData.get("email");
        String password = userData.get("password");
        String confirmPassword = userData.get("confirmPassword");
        String panNumber = userData.get("panNumber");
        String mobileNumber = userData.get("mobileNumber");
        String gender = userData.get("gender");
        String dob = userData.get("dob");

        // Check for missing fields
        if (email == null || password == null || confirmPassword == null || panNumber == null ||
                mobileNumber == null || gender == null || dob == null) {
            return ResponseEntity.badRequest().body("All fields are required!");
        }

        // Confirm password validation
        if (!password.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body("Passwords do not match!");
        }

        // PAN validation (Format: ABCDE1234F)
        if (!panNumber.matches("[A-Z]{5}[0-9]{4}[A-Z]{1}")) {
            return ResponseEntity.badRequest().body("Invalid PAN format! (Example: ABCDE1234F)");
        }

        // Mobile number validation (10 digits only)
        if (!mobileNumber.matches("\\d{10}")) {
            return ResponseEntity.badRequest().body("Mobile number must be exactly 10 digits!");
        }

        // Gender validation
        if (!gender.equalsIgnoreCase("Male") && !gender.equalsIgnoreCase("Female") && !gender.equalsIgnoreCase("Other")) {
            return ResponseEntity.badRequest().body("Invalid gender! Allowed values: Male, Female, Other");
        }

        // Date of Birth (DOB) validation (Format: YYYY-MM-DD)
        if (!dob.matches("\\d{4}-\\d{2}-\\d{2}")) {
            return ResponseEntity.badRequest().body("Invalid date of birth format! Use YYYY-MM-DD");
        }

        // Check if email, PAN, or mobile number already exist
        if (userService.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("Email is already in use!");
        }

        if (userService.existsByPanNumber(panNumber)) {
            return ResponseEntity.badRequest().body("PAN number is already registered!");
        }

        if (userService.existsByMobileNumber(mobileNumber)) {
            return ResponseEntity.badRequest().body("Mobile number is already registered!");
        }

        // Register user
        User newUser = new User(email, password, 0.0, panNumber, mobileNumber, gender, dob);
        User savedUser = userService.registerUser(newUser);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        try {
            User loggedInUser = userService.loginUser(loginRequest.getEmail(), loginRequest.getPassword());
            return ResponseEntity.ok(loggedInUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        User updated = userService.updateUser(id, updatedUser);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        boolean deleted = userService.deleteUser(id);
        if (deleted) {
            return ResponseEntity.ok("User deleted successfully.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @PostMapping("/{id}/addBalance")
    public ResponseEntity<User> addBalance(@PathVariable Long id, @RequestBody Map<String, Double> request) {
        Double amount = request.get("amount");
        if (amount == null || amount <= 0) {
            return ResponseEntity.badRequest().body(null);
        }
        User updatedUser = userService.addBalance(id, amount);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/{id}/withdrawBalance")
    public ResponseEntity<User> withdrawBalance(@PathVariable Long id, @RequestBody Map<String, Double> request) {
        Double amount = request.get("amount");

        if (amount == null || amount <= 0) {
            return ResponseEntity.badRequest().body(null);
        }

        User updatedUser = userService.withdrawBalance(id, amount);
        if (updatedUser == null) {
            return ResponseEntity.badRequest().body(null);  // Handle insufficient funds
        }

        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
