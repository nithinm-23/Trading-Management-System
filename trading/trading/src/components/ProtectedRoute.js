// src/components/ProtectedRoute.js
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const isProfileComplete =
    user.profileCompleted ?? user.profile_completed ?? 0;
  const isEmailVerified = user?.emailVerified ?? user?.email_verified ?? false;
  const isMobileVerified =
    user?.mobileVerified ?? user?.mobile_verified ?? false;

  const token = localStorage.getItem("authToken");

  // If no user, redirect to login
  if (!user || !token) {
    return <Navigate to="/" replace />;
  }

  // Allow /complete-profile route for incomplete profiles
  if (
    location.pathname !== "/complete-profile" &&
    user.provider === "google" &&
    !isProfileComplete
  ) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (
    isProfileComplete &&
    !isEmailVerified &&
    location.pathname !== "/verify-email"
  ) {
    return <Navigate to="/verify-email" replace />;
  }

  // After email, mobile should be verified
  if (
    isProfileComplete &&
    isEmailVerified &&
    !isMobileVerified &&
    location.pathname !== "/verify-mobile"
  ) {
    return <Navigate to="/verify-mobile" replace />;
  }

  return children;
};

export default ProtectedRoute;
