// src/pages/ProfileComplete.js
import React, { useState, useEffect } from "react";
import "../styles/Profile.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/ProfileComplete.css"; // Custom styles for this page
import { useNavigate } from "react-router-dom";

const ProfileComplete = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dob: "",
    panNumber: "",
    gender: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      toast.error("User not found. Please sign in.");
      navigate("/");
    }
  }, [user, navigate]);

  const validatePAN = (panNumber) =>
    /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "panNumber" && value !== "") {
      if (!validatePAN(value)) {
        setErrors((prev) => ({ ...prev, panNumber: "Invalid PAN format" }));
      } else {
        setErrors((prev) => {
          const { panNumber, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const dob = new Date(formData.dob);
    const today = new Date();
    const age =
      today.getFullYear() -
      dob.getFullYear() -
      (today.getMonth() < dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
        ? 1
        : 0);

    if (age < 18) {
      toast.error("You must be at least 18 years old to use this platform.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(
        "http://localhost:8080/api/users/complete-profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: user.name,
            dob: formData.dob,
            gender: formData.gender,
            panNumber: formData.panNumber,
            mobileNumber: formData.mobileNumber,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Profile update failed");
      }

      toast.success("Profile completed successfully!");

      // 🧠 Update localStorage to prevent redirect back to /complete-profile
      const updatedUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        balance: user.balance || 0,
        profileCompleted: true,
        mobileNumber: formData.mobileNumber,
        gender: formData.gender,
        dob: formData.dob,
        panNumber: formData.panNumber,
        mobileVerified: false,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("userData", JSON.stringify(updatedUser));

      setTimeout(() => {
        navigate("/verify-mobile");
      }, 1000);
    } catch (err) {
      console.error("Submit Error:", err);
      toast.error("Failed to complete profile. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-complete-container animate-fadein">
      <div className="form-card">
        <h2 className="form-title">Complete Your Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group floating-label">
            <input
              type="text"
              name="name"
              value={user?.name}
              readOnly
              required
            />
            <label>Full Name</label>
          </div>
          <div className="form-group floating-label">
            <input
              type="email"
              name="email"
              value={user?.email}
              readOnly
              required
            />
            <label>Email</label>
          </div>
          <div className="form-group floating-label">
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
            />
            <label>Date of Birth</label>
          </div>
          <div className="form-group floating-label">
            <input
              type="text"
              name="panNumber"
              value={formData.panNumber}
              onChange={handleChange}
              required
              maxLength={10}
              style={{ textTransform: "uppercase" }}
            />
            <label>PAN Number</label>
            {errors.panNumber && (
              <span className="error-text">{errors.panNumber}</span>
            )}
          </div>
          <div className="form-group floating-label">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <label>Gender</label>
          </div>
          <div className="form-group floating-label">
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
              maxLength={10}
              pattern="[6-9]{1}[0-9]{9}"
              title="Please enter a valid 10-digit Indian mobile number"
            />
            <label>Mobile Number</label>
          </div>

          <div className="form-group floating-label">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
            <label>Set Password</label>
          </div>

          <div className="form-group floating-label">
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
            />
            <label>Confirm Password</label>
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileComplete;
