import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/VerifyEmail.css";

const VerifyEmail = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const sentOnceRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.email) {
      toast.error("Email not found. Please login again.");
      navigate("/");
      return;
    }

    // ✅ Ensure OTP is only sent once
    if (!sentOnceRef.current) {
      sendOtp();
      sentOnceRef.current = true;
    }

    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const sendOtp = async () => {
    try {
      await fetch("http://localhost:8080/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      toast.success("OTP sent to your email!");
      setResendTimer(30);
    } catch (error) {
      toast.error("Failed to send OTP");
      console.error(error);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, otp }),
      });

      if (res.ok) {
        toast.success("Email verified successfully!");

        const updatedUser = { ...user, emailVerified: true };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        localStorage.setItem("userData", JSON.stringify(updatedUser));

        setTimeout(() => navigate("/verify-mobile"), 1500);
      } else {
        toast.error("Invalid OTP. Try again.");
      }
    } catch (err) {
      toast.error("Something went wrong during verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h2>Verify Your Email</h2>
        <p>
          OTP sent to <strong>{user.email}</strong>
        </p>
        <input
          type="text"
          placeholder="Enter OTP"
          maxLength="6"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="otp-input"
        />
        <button
          onClick={handleVerify}
          disabled={loading}
          className="verify-btn"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>
        <button
          onClick={sendOtp}
          disabled={resendTimer > 0}
          className="resend-btn"
        >
          {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
