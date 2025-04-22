package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.security.CurrentUser;
import com.example.demo.security.UserPrincipal;
import com.example.demo.service.UserService;
import com.example.demo.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final UserService userService;
    private final JwtTokenProvider tokenProvider;

    public AuthController(UserService userService, JwtTokenProvider tokenProvider) {
        this.userService = userService;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody Map<String, String> payload) {
        try {
            String token = payload.get("token");
            String name = payload.get("name");

            logger.info("Received Google auth request for user: {}", name);

            if (token == null || token.isEmpty()) {
                logger.warn("Empty Google token received");
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Google token is required"
                ));
            }

            User user = userService.processGoogleUser(token, name);
            logger.info("Processed Google user: {}", user.getEmail());

            UserPrincipal userPrincipal = new UserPrincipal(user);
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userPrincipal,
                    null,
                    userPrincipal.getAuthorities()
            );

            String jwt = tokenProvider.generateToken(authentication);
            logger.info("Generated JWT token for user: {}", user.getEmail());

            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("email", user.getEmail());
            userMap.put("name", user.getName());
            userMap.put("mobileNumber", user.getMobileNumber());
            userMap.put("emailVerified", user.isEmailVerified());
            userMap.put("mobileVerified", user.isMobileVerified());
            userMap.put("profileCompleted", user.isProfileCompleted());
            userMap.put("provider", user.getProvider());
            userMap.put("balance", user.getBalance());

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("user", userMap);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Google authentication failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("Google authentication error", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Google authentication failed",
                    "details", e.getMessage()
            ));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser(@CurrentUser UserPrincipal userPrincipal) {
        return ResponseEntity.ok(userPrincipal);
    }
}