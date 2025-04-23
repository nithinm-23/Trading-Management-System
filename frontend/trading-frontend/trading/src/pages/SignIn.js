import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/SignIn.css";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/login",
        {
          email: email,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // required if you're using cookies
        }
      );

      // Debug logs
      console.log("Login response:", response.data);
      console.log("Sending login request:", { email, password });

      const { token, user } = response.data;

      if (token && user) {
        localStorage.setItem("authToken", token); // ✅ For Authorization
        localStorage.setItem("user", JSON.stringify(user)); // ✅ Basic Info
        localStorage.setItem("userData", JSON.stringify(user)); // ✅ Full Profile

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
      console.error("Login error:", error.response?.data);
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

      // Store all existing data
      localStorage.setItem("authToken", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("email", user.email);
      localStorage.setItem("name", user.name);
      if (user.balance) localStorage.setItem("balance", user.balance);

      // Store the complete user object for profile completion check
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userData", JSON.stringify(user));

      // Set auth token for Axios globally
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      toast.success("Google login successful! Redirecting...");

      // Modified redirect logic
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
      console.error("Google login error:", error);
    }
  };

  // useEffect(() => {
  //   // Clear everything when coming to SignIn page ("/")
  //   localStorage.clear();
  // }, []);

  return (
    <div className="signin-container">
      <ToastContainer />
      <div className="row w-75 shadow rounded overflow-hidden bg-white">
        {/* Left Side */}
        <div className="col-md-6 d-flex flex-column align-items-center justify-content-center text-white p-5 left-section">
          <h2 className="fw-bold">Welcome Back</h2>
          <p className="text-center">Sign in to continue your journey</p>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="col-md-6 bg-white p-5">
          <h3 className="text-center mb-4">Sign In</h3>
          <form onSubmit={handleSignIn}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 mb-3">
              Sign In
            </button>

            <div className="text-center mb-3">
              <span className="text-muted">OR</span>
            </div>

            <div className="d-flex justify-content-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  toast.error("Google login failed");
                }}
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
