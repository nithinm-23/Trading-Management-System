package com.example.demo.service;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmailOtpServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private EmailOtpService emailOtpService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    @Test
    void testSendOtp_Success() throws Exception {
        String email = "test@example.com";
        emailOtpService.sendOtp(email);

        verify(mailSender, times(1)).send(mimeMessage);

        // Use reflection to get OTP
        java.lang.reflect.Field field = EmailOtpService.class.getDeclaredField("otpStorage");
        field.setAccessible(true);
        Map<String, String> otpStorage = (Map<String, String>) field.get(emailOtpService);

        String otp = otpStorage.get(email);
        assertTrue(emailOtpService.verifyOtp(email, otp));
    }


    @Test
    void testVerifyOtp_Success() throws Exception {
        String email = "test@example.com";
        emailOtpService.sendOtp(email);

        // Access private otpStorage using reflection
        java.lang.reflect.Field field = EmailOtpService.class.getDeclaredField("otpStorage");
        field.setAccessible(true);
        Map<String, String> otpStorage = (Map<String, String>) field.get(emailOtpService);

        String otp = otpStorage.get(email);
        assertNotNull(otp);
        assertTrue(emailOtpService.verifyOtp(email, otp));
    }


    @Test
    void testVerifyOtp_Failure() {
        String email = "test@example.com";
        emailOtpService.sendOtp(email);
        assertFalse(emailOtpService.verifyOtp(email, "wrongOtp"));
    }

    @Test
    void testSendOtp_Failure() {
        String email = "test@example.com";

        when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("Mail server error"));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            emailOtpService.sendOtp(email);
        });

        assertEquals("Mail server error", exception.getMessage());
    }
}
