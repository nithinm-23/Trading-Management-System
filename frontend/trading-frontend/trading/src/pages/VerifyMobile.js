// src/pages/VerifyMobile.js
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/VerifyMobile.css";

const VerifyMobile = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const user = JSON.parse(localStorage.getItem("user"));
  const sentOnceRef = useRef(false);
  const navigate = useNavigate();

  const maskedMobile = user?.mobileNumber
    ? user.mobileNumber.replace(/^(\d{2})(\d{4})(\d{4})$/, "$1****$3")
    : "";

  useEffect(() => {
    if (!user) {
      return;
    }
    if (!user.mobileNumber) {
      toast.error("Mobile number not found. Please complete profile first.");
      navigate("/complete-profile");
      return;
    }

    // ✅ Ensure OTP is only sent once
    if (!sentOnceRef.current) {
      sendOtp();
      sentOnceRef.current = true;
    }

    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const sendOtp = async () => {
    try {
      setResendTimer(30);
      await fetch("http://localhost:8080/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: user.mobileNumber }),
      });
      setResendTimer(10);
      toast.success("OTP sent to your mobile!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send OTP");
    }
  };

  // Prevent accidental double clicks
  const handleResendClick = () => {
    if (resendTimer === 0) {
      sendOtp();
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: user.mobileNumber, otp }),
      });

      if (res.ok) {
        toast.success("✅ Mobile verified successfully!");

        // Update user in localStorage
        const updatedUser = {
          ...user,
          mobileVerified: true,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        localStorage.setItem("userData", JSON.stringify(updatedUser));

        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        toast.error("❌ Invalid OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Something went wrong during verification.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  console.log("user from localStorage:", user);
  console.log("Rendering VerifyMobile page...");

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h2>Verify Your Mobile</h2>
        <p>
          OTP sent to <strong>+91-{maskedMobile}</strong>
        </p>

        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          maxLength="6"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="otp-input"
        />

        <button
          className="verify-btn"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          className="resend-btn"
          onClick={sendOtp}
          disabled={resendTimer > 0}
        >
          {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
        </button>
      </div>
    </div>
  );
};

export default VerifyMobile;
