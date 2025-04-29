package com.example.demo.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TwilioService {

//    @Value("${twilio.account_sid}")
    private String ACCOUNT_SID="AC0f9dbbc31cd08a287297ef70b7d16ef2";

//    @Value("${twilio.auth_token}")
    private String AUTH_TOKEN="90ad0999985116ad17ce7f69e14bfc9c";

//    @Value("${twilio.from_number}")
    private String FROM_NUMBER="+19786447259";

    public TwilioService() {
        Twilio.init(ACCOUNT_SID, AUTH_TOKEN);
    }

    public void sendOtp(String toNumber, String otp) {

        if (toNumber == null || toNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Mobile number is null or empty");
        }

        System.out.println("Sending OTP to: " + toNumber); // ✅ Debug log
        String messageBody = "Your OTP is " + otp;

        Message.creator(
                new com.twilio.type.PhoneNumber("+91" + toNumber),
                new com.twilio.type.PhoneNumber(FROM_NUMBER),
                messageBody
        ).create();
    }
}
