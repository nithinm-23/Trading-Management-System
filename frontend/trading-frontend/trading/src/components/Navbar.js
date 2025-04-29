import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check auth status on component mount
  React.useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsLoggedIn(true);
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error("Token decoding failed:", error);
      }
    }
  }, []);

  // Handle Google login success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/google",
        {
          token: credentialResponse.credential,
        }
      );

      const { token } = response.data;
      localStorage.setItem("authToken", token);
      setIsLoggedIn(true);
      const decoded = jwtDecode(token);
      setUser(decoded);

      toast.success("Logged in successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      navigate("/dashboard");
    } catch (error) {
      toast.error("Login failed. Please try again.", {
        position: "top-right",
        autoClose: 2000,
      });
      console.error("Login error:", error);
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUser(null);
    googleLogout();
    setIsMobileMenuOpen(false);

    toast.success("Logged out successfully!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    setTimeout(() => {
      navigate("/", { replace: true });
    }, 2000);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
      <div className="container-fluid">
        {/* Website Title */}
        <Link className="navbar-brand fw-bold" to="/">
          StockPro
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation"
        >
          {isMobileMenuOpen ? (
            <X className="text-white" size={24} />
          ) : (
            <Menu className="text-white" size={24} />
          )}
        </button>

        {/* Navigation Links */}
        <div
          className={`collapse navbar-collapse ${
            isMobileMenuOpen ? "show" : ""
          }`}
          id="navbarSupportedContent"
        >
          <div className="d-flex flex-column flex-lg-row align-items-center w-100">
            {/* Navigation Links */}
            {isLoggedIn && (
              <div className="d-flex flex-column flex-lg-row align-items-center ms-lg-auto me-lg-3">
                <NavLink to="/dashboard" onClick={toggleMobileMenu}>
                  Dashboard
                </NavLink>
                <NavLink to="/explore" onClick={toggleMobileMenu}>
                  Explore
                </NavLink>
                <NavLink to="/holdings" onClick={toggleMobileMenu}>
                  Holdings
                </NavLink>
                <NavLink to="/profile" onClick={toggleMobileMenu}>
                  Profile
                </NavLink>
                <NavLink to="/about" onClick={toggleMobileMenu}>
                  About
                </NavLink>
              </div>
            )}

            {/* Auth Buttons */}
            <div className="mt-3 mt-lg-0">
              {isLoggedIn ? (
                <button className="btn btn-danger" onClick={handleLogout}>
                  Logout
                </button>
              ) : (
                <div className="google-auth-container">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      toast.error("Google login failed", {
                        position: "top-right",
                        autoClose: 2000,
                      });
                    }}
                    theme="filled_blue"
                    size="medium"
                    shape="rectangular"
                    text="signin_with"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Reusable NavLink component
const NavLink = ({ to, children, onClick }) => (
  <Link
    to={to}
    className="nav-link text-white px-3 py-2 py-lg-1 my-1 my-lg-0 rounded"
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Navbar;
