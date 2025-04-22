package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class OTPService {

    private final Map<String, String> otpMap = new HashMap<>();
    private final RestTemplate restTemplate = new RestTemplate();

    private final String apiKey = "NuXZshAe8jndTmKDiIlz26r4SaftV30BpMFYgWqw517yvxJbcHDMVi5dtuNA2h6IpOQZKXRkG8sJSb0c";

    public String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

//    public boolean sendOtp(String mobile) {
//        String otp = generateOtp();
//        otpMap.put(mobile, otp);
//
//        String message = "Your OTP for verification is " + otp;
//        String url = "https://www.fast2sms.com/dev/bulkV2";
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.set("authorization", apiKey);
//        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
//
//        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
//        body.add("route", "otp");
//        body.add("variables_values", otp);
//        body.add("numbers", mobile);
//
//        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
//
//        try {
//            restTemplate.postForEntity(url, request, String.class);
//            return true;
//        } catch (Exception e) {
//            e.printStackTrace();
//            return false;
//        }
//    }

//    public boolean sendOtp(String mobile) {
//        String otp = generateOtp();
//        otpMap.put(mobile, otp);
//
//        String url = "https://www.fast2sms.com/dev/bulkV2";
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
//        headers.set("authorization", apiKey);
//
//        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
//        body.add("sender_id", "FSTSMS");
//        body.add("message", "Your OTP is " + otp);
//        body.add("language", "english");
//        body.add("route", "v3");
//        body.add("numbers", mobile);
//
//        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);
//
//        try {
//            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
//            System.out.println("OTP: " + otp + " | Sent Response: " + response.getBody());
//            return response.getStatusCode().is2xxSuccessful();
//        } catch (Exception e) {
//            e.printStackTrace();
//            return false;
//        }
//    }


    public boolean verifyOtp(String mobileNumber, String otp) {
        return otp.equals(otpMap.get(mobileNumber));
    }

    @Autowired
    private TwilioService twilioService;

    public boolean sendOtp(String mobileNumber) {
        String otp = generateOtp();
        otpMap.put(mobileNumber, otp);

        try {
            twilioService.sendOtp(mobileNumber, otp);
            System.out.println("OTP sent via Twilio: " + otp);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

}

