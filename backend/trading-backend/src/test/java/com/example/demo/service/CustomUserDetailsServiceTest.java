package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CustomUserDetailsServiceTest {

    private UserRepository userRepository;
    private CustomUserDetailsService customUserDetailsService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        customUserDetailsService = new CustomUserDetailsService(userRepository);
    }

    @Test
    void loadUserByUsername_ShouldReturnUserDetails_WhenUserExists() {
        // Arrange
        String email = "test@example.com";
        User user = new User();
        user.setId(1L);
        user.setEmail(email);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        // Act
        UserPrincipal userPrincipal = (UserPrincipal) customUserDetailsService.loadUserByUsername(email);

        // Assert
        assertNotNull(userPrincipal);
        assertEquals(user.getId(), userPrincipal.getId());
        assertEquals(user.getEmail(), userPrincipal.getEmail());

        verify(userRepository, times(1)).findByEmail(email);
    }

    @Test
    void loadUserByUsername_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        String email = "notfound@example.com";

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act & Assert
        UsernameNotFoundException exception = assertThrows(
                UsernameNotFoundException.class,
                () -> customUserDetailsService.loadUserByUsername(email)
        );

        assertEquals("User not found with email : " + email, exception.getMessage());
        verify(userRepository, times(1)).findByEmail(email);
    }

    @Test
    void loadUserById_ShouldReturnUserDetails_WhenUserExists() {
        // Arrange
        Long userId = 1L;
        User user = new User();
        user.setId(userId);
        user.setEmail("test@example.com");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // Act
        UserPrincipal userPrincipal = (UserPrincipal) customUserDetailsService.loadUserById(userId);

        // Assert
        assertNotNull(userPrincipal);
        assertEquals(user.getId(), userPrincipal.getId());
        assertEquals(user.getEmail(), userPrincipal.getEmail());

        verify(userRepository, times(1)).findById(userId);
    }

    @Test
    void loadUserById_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        Long userId = 99L;

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        UsernameNotFoundException exception = assertThrows(
                UsernameNotFoundException.class,
                () -> customUserDetailsService.loadUserById(userId)
        );

        assertEquals("User not found with id: " + userId, exception.getMessage());
        verify(userRepository, times(1)).findById(userId);
    }
}
