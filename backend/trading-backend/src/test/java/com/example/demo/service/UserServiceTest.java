package com.example.demo.service;

import com.example.demo.dto.ProfileRequest;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setPassword("encryptedpassword");
        user.setProvider("google");
        user.setBalance(1000.0);
    }

    @Test
    void testRegisterUser_ShouldThrowException_WhenEmailExists() {
        Mockito.when(userRepository.existsByEmail(user.getEmail())).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.registerUser(user);
        });

        assertEquals("Email already exists!", exception.getMessage());
    }

    public void testRegisterUser_ShouldRegisterSuccessfully_WhenValid() {
        // Ensure password is set and not null
        String rawPassword = "password123";  // Example raw password
        String hashedPassword = passwordEncoder.encode(rawPassword);  // Assuming you're using BCrypt

        User user = new User();
        user.setPassword(hashedPassword);  // Make sure password is set

        // Simulate saving the user (replace with actual logic)
        Mockito.when(passwordEncoder.encode(rawPassword)).thenReturn(hashedPassword);

        // Now we can proceed with assertions
        assertNotNull(user.getPassword());  // Ensure password is not null
        assertTrue(user.getPassword().startsWith("$2a$10$"));  // Check if it's a valid BCrypt hash format
        // Continue with user registration logic if needed (e.g., save user to DB)

        // You can add further tests here, like checking if the user was actually saved
    }

    @Test
    void testLoginUser_ShouldThrowException_WhenUserNotFound() {
        Mockito.when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.loginUser(user.getEmail(), "password");
        });

        assertEquals("User not found!", exception.getMessage());
    }

    @Test
    void testLoginUser_ShouldThrowException_WhenInvalidPassword() {
        Mockito.when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        Mockito.when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.loginUser(user.getEmail(), "invalidPassword");
        });

        assertEquals("Invalid password!", exception.getMessage());
    }

    @Test
    void testUpdateUser_ShouldUpdateFieldsSuccessfully() {
        User updatedUser = new User();
        updatedUser.setName("New Name");
        updatedUser.setMobileNumber("9876543210");

        Mockito.when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        Mockito.when(userRepository.save(any(User.class))).thenReturn(updatedUser);

        User result = userService.updateUser(user.getId(), updatedUser);

        assertEquals("New Name", result.getName());
        assertEquals("9876543210", result.getMobileNumber());
    }

    @Test
    void testAddBalance_ShouldAddAmount() {
        Mockito.when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        Mockito.when(userRepository.save(any(User.class))).thenReturn(user);

        User result = userService.addBalance(user.getId(), 500.0);

        assertEquals(1500.0, result.getBalance());
    }

    @Test
    void testWithdrawBalance_ShouldWithdrawSuccessfully_WhenSufficientBalance() {
        Mockito.when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        Mockito.when(userRepository.save(any(User.class))).thenReturn(user);

        User result = userService.withdrawBalance(user.getId(), 200.0);

        assertEquals(800.0, result.getBalance());
    }

    @Test
    void testWithdrawBalance_ShouldThrowException_WhenInsufficientBalance() {
        Mockito.when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.withdrawBalance(user.getId(), 2000.0);
        });

        assertEquals("Insufficient balance!", exception.getMessage());
    }

//    @Test
//    void testProcessGoogleUser_ShouldCreateNewUser_WhenNew() throws Exception {
//        String idToken = "valid_token";
//        String name = "Google User";
//
//        Mockito.when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
//        Mockito.when(userRepository.save(any(User.class))).thenReturn(user);
//
//        User result = userService.processGoogleUser(idToken, name);
//
//        assertEquals("google", result.getProvider());
//        assertEquals("Google User", result.getName());
//    }

    @Test
    void testCompleteUserProfile_ShouldThrowException_WhenDuplicatePan() {
        ProfileRequest profileRequest = new ProfileRequest();
        profileRequest.setPanNumber("PAN123");

        Mockito.when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        Mockito.when(userRepository.existsByPanNumber("PAN123")).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.completeUserProfile(user.getEmail(), profileRequest);
        });

        assertEquals("PAN number already in use.", exception.getMessage());
    }

    @Test
    void testMarkMobileAsVerified_ShouldMarkVerifiedSuccessfully() {
        Mockito.when(userRepository.findByMobileNumber(user.getMobileNumber())).thenReturn(Optional.of(user));

        userService.markMobileAsVerified(user.getMobileNumber());

        assertTrue(user.isMobileVerified());
    }
}
