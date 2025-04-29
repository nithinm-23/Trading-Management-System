import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/SignIn.css"; // Make sure this points to your CSS file

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/login",
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const { token, user } = response.data;
      if (token && user) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userData", JSON.stringify(user));

        toast.success("Signed in successfully! Redirecting...");
        setTimeout(() => {
          if (!user.emailVerified) {
            navigate("/verify-email");
          } else if (!user.mobileVerified) {
            navigate("/verify-mobile");
          } else {
            navigate("/dashboard");
          }
        }, 2000);
      } else {
        toast.error("Invalid response from server.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Invalid email or password. Try again."
      );
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const response = await axios.post(
        "http://localhost:8080/api/auth/google",
        {
          token: credentialResponse.credential,
          name: decoded.name || "",
        },
        { withCredentials: true }
      );

      const { token, user } = response.data;
      localStorage.setItem("authToken", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("email", user.email);
      localStorage.setItem("name", user.name);
      if (user.balance) localStorage.setItem("balance", user.balance);

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userData", JSON.stringify(user));

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      toast.success("Google login successful! Redirecting...");
      setTimeout(() => {
        if (user.provider === "google" && !user.profileCompleted) {
          navigate("/complete-profile");
        } else if (!user.mobileVerified) {
          navigate("/verify-mobile");
        } else {
          navigate("/dashboard");
        }
      }, 2000);
    } catch (error) {
      toast.error("Google login failed. Please try again.");
    }
  };

  return (
    <div className="signin-container">
      <ToastContainer />
      <div className="row w-100 m-0 signin-card">
        <div className="col-md-6 signin-left">
          <h2 className="fw-bold">Welcome Back</h2>
          <p className="text-center">Sign in to continue your journey</p>
        </div>
        <div className="col-md-6 signin-form-section">
          <h3 className="text-center mb-4">Sign In</h3>
          <form onSubmit={handleSignIn}>
            <div className="mb-3">
              <label className="signin-label">Email</label>
              <input
                type="email"
                className="form-control signin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="signin-label">Password</label>
              <input
                type="password"
                className="form-control signin-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="signin-btn mb-3">
              Sign In
            </button>
            <div className="signin-divider">OR</div>
            <div className="signin-google-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google login failed")}
                theme="filled_blue"
                size="medium"
                text="signin_with"
              />
            </div>
          </form>
          <p className="mt-3 text-center">
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
