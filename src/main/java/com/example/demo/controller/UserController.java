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
    public ResponseEntity<User> registerUser(@RequestBody User newUser) {
        User savedUser = userService.registerUser(newUser);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<User> loginUser(@RequestBody User loginRequest) {
        User loggedInUser = userService.loginUser(loginRequest.getEmail(), loginRequest.getPassword());
        return ResponseEntity.ok(loggedInUser);
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
