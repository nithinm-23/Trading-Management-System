package com.example.demo.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ProfileRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]{1}$", message = "Invalid PAN format")
    private String panNumber;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian mobile number")
    private String mobileNumber;

    private String gender;

    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Date must be in yyyy-MM-dd format")
    private String dob;

    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @Size(min = 6, message = "Confirm Password must be at least 6 characters")
    private String confirmPassword;
}