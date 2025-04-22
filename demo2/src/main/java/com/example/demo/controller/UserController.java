package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.ProfileRequest;
import com.example.demo.dto.UserRegistrationDto;
import com.example.demo.model.ProfileCompletionRequest;
import com.example.demo.model.User;
import com.example.demo.security.JwtTokenProvider;
import com.example.demo.security.UserPrincipal;
import com.example.demo.service.UserService;
import com.example.demo.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;


import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private final UserService userService;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserController(UserService userService, UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegistrationDto registrationDto,
                                          BindingResult bindingResult) {

        // Validate DTO fields using annotations
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }

        // Additional business validations
        if (!registrationDto.getPassword().equals(registrationDto.getConfirmPassword())) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("confirmPassword", "Passwords do not match!"));
        }

        if (userService.existsByEmail(registrationDto.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("email", "Email is already in use!"));
        }

        if (userService.existsByPanNumber(registrationDto.getPanNumber())) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("panNumber", "PAN number is already registered!"));
        }

        if (userService.existsByMobileNumber(registrationDto.getMobileNumber())) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("mobileNumber", "Mobile number is already registered!"));
        }

        // Create and save user
        User newUser = new User();
        newUser.setEmail(registrationDto.getEmail());
        newUser.setPassword(registrationDto.getPassword());
        newUser.setName(registrationDto.getName());
        newUser.setPanNumber(registrationDto.getPanNumber());
        newUser.setMobileNumber(registrationDto.getMobileNumber());
        newUser.setGender(registrationDto.getGender());
        newUser.setDob(registrationDto.getDob());
        newUser.setProvider("local");
        newUser.setBalance(0.0);
        newUser.setVerified(false);
        newUser.setProfileCompleted(false);

//        System.out.println("DTO Password: " + registrationDto.getPassword());

        User savedUser = userService.registerUser(newUser);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        System.out.println("LoginRequest payload: " + loginRequest);
        try {
            User user = userService.loginUser(loginRequest.getEmail(), loginRequest.getPassword());

            // Generate JWT token
            UserPrincipal userPrincipal = new UserPrincipal(user);
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userPrincipal,
                    null,
                    userPrincipal.getAuthorities()
            );
            String jwt = jwtTokenProvider.generateToken(authentication);

            // Prepare user data to send
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("email", user.getEmail());
            userMap.put("name", user.getName());
            userMap.put("mobileNumber", user.getMobileNumber());
            userMap.put("mobileVerified", user.isMobileVerified());
            userMap.put("emailVerified", user.isEmailVerified());
            userMap.put("profileCompleted", user.isProfileCompleted());
            userMap.put("provider", user.getProvider());
            userMap.put("balance", user.getBalance());
            userMap.put("dob", user.getDob());
            userMap.put("gender", user.getGender());
            userMap.put("panNumber", user.getPanNumber());

            // Final response
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("user", userMap);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        try {
            User updated = userService.updateUser(id, updatedUser);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
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
        System.out.println("Fetching user with ID: " + id);
        User user = userService.getUserById(id);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    public boolean changePassword(Long userId, String oldPassword, String newPassword) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // Skip password check for Google users without password
            if ("google".equals(user.getProvider()) &&
                    (user.getPassword() == null || user.getPassword().isEmpty())) {
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                return true;
            }

            // Original logic for regular users
            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                return false;
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @PutMapping("/{userId}/set-password")
    public ResponseEntity<?> setPassword(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        String newPassword = request.get("newPassword");

        if (userService.setPassword(userId, newPassword)) {
            return ResponseEntity.ok("Password set successfully");
        }
        return ResponseEntity.badRequest().body("Failed to set password");
    }

    @GetMapping("/{userId}/balance")
    public ResponseEntity<Map<String, Double>> getUserBalance(@PathVariable Long userId) {
        double balance = userService.getBalance(userId);
        return ResponseEntity.ok(Collections.singletonMap("balance", balance));
    }

//    @PutMapping("/{id}/complete-profile")
//    public ResponseEntity<?> completeProfile(
//            @PathVariable Long id,
//            @Valid @RequestBody ProfileCompletionRequest request,
//            BindingResult bindingResult) {
//        // Validation
//        if (bindingResult.hasErrors()) {
//            return ResponseEntity.badRequest().body("Invalid profile data");
//        }
//
//        User user = userService.getUserById(id);
//        if (user == null || !"google".equals(user.getProvider())) {
//            return ResponseEntity.badRequest().body("Invalid user or provider");
//        }
//
//        // Validate PAN format
//        if (!request.getPanNumber().matches("[A-Z]{5}[0-9]{4}[A-Z]{1}")) {
//            return ResponseEntity.badRequest().body("Invalid PAN format");
//        }
//
//        // Validate mobile number
//        if (!request.getMobileNumber().matches("\\d{10}")) {
//            return ResponseEntity.badRequest().body("Invalid mobile number");
//        }
//
//        // Validate gender
//        if (!Arrays.asList("Male", "Female", "Other").contains(request.getGender())) {
//            return ResponseEntity.badRequest().body("Invalid gender");
//        }
//
//        // Update user
//        user.setName(request.getName());
//        user.setPanNumber(request.getPanNumber());
//        user.setDob(request.getDob());
//        user.setGender(request.getGender());
//        user.setMobileNumber(request.getMobileNumber());
//        user.setProfileCompleted(true);
//
//        try {
//            User updatedUser = userService.save(user);
//            return ResponseEntity.ok(updatedUser);
//        } catch (Exception e) {
//            return ResponseEntity.internalServerError().body("Failed to update profile");
//        }
//    }

    @PostMapping("/complete-profile")
    public ResponseEntity<?> completeUserProfile(@RequestBody ProfileRequest profileRequest, HttpServletRequest request) {
        System.out.println("Received password: " + profileRequest.getPassword());
        try {
            String token = jwtTokenProvider.resolveToken(request);

            if (token == null || !jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing token");
            }

            String email = jwtTokenProvider.getUsername(token);
            userService.completeUserProfile(email, profileRequest);

            return ResponseEntity.ok("Profile completed successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong: " + e.getMessage());
        }
    }

}