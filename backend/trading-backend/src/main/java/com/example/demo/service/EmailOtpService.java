package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailOtpService {

    private final Map<String, String> otpStorage = new HashMap<>();

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtp(String email) {
        String otp = String.valueOf((int)(Math.random() * 900000 + 100000));
        otpStorage.put(email, otp);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("StockPro: Verify Your Email with OTP");

            String htmlContent = "<html>" +
                    "<body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>" +
                    "  <div style='max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);'>" +
                    "    <h2 style='color: #2c3e50;'>Welcome to <span style='color: #27ae60;'>StockPro</span></h2>" +
                    "    <p>Hi there 👋,</p>" +
                    "    <p>Your One-Time Password (OTP) for verifying your email is:</p>" +
                    "    <div style='text-align: center; margin: 30px 0;'>" +
                    "      <span style='font-size: 32px; color: #e74c3c; font-weight: bold;'>" + otp + "</span>" +
                    "    </div>" +
                    "    <p>This OTP is valid for 5 minutes. Please do not share this code with anyone.</p>" +
                    "    <p>If you did not request this, kindly ignore this email.</p>" +
                    "    <br/>" +
                    "    <p>Cheers,</p>" +
                    "    <p><strong>Team StockPro</strong></p>" +
                    "    <hr style='margin-top: 40px;'/>" +
                    "    <p style='font-size: 12px; color: #888888;'>This is an automated message. Please do not reply to this email.</p>" +
                    "  </div>" +
                    "</body>" +
                    "</html>";

            helper.setText(htmlContent, true); // true means HTML

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    public boolean verifyOtp(String email, String otp) {
        return otp.equals(otpStorage.get(email));
    }
}