package com.example.demo.controller;

import com.example.demo.model.FeedbackRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/send-feedback")
public class FeedbackController {

    @Autowired
    private JavaMailSender mailSender;

    @PostMapping
    public String sendFeedback(@RequestBody FeedbackRequest request) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo("charumittal334@gmail.com"); // Replace with your email
//            message.setSubject("New Feedback from " + request.getEmail());
            message.setText(request.getMessage());
            mailSender.send(message);
            return "Feedback sent successfully!";
        } catch (Exception e) {
            return "Error sending feedback";
        }
    }
}