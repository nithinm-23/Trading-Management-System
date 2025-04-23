import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [user, setUser] = React.useState(null);

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

  // Common button styles
  const buttonStyle = {
    border: "none",
    background: "transparent",
    color: "white",
    padding: "8px 16px",
    borderRadius: "4px",
    transition: "all 0.3s ease",
  };

  const hoverStyle = {
    background: "gray",
    color: "black",
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
      <div className="container-fluid">
        {/* Website Title */}
        <a className="navbar-brand fw-bold" href="/">
          StockPro
        </a>

        {/* Right Side Buttons */}
        <div className="d-flex align-items-center">
          {/* Navigation Links (Hover Effect Applied) */}
          {isLoggedIn && (
            <>
              <Link
                to="/dashboard"
                className="btn text-white me-3"
                style={buttonStyle}
                onMouseEnter={(e) => Object.assign(e.target.style, hoverStyle)}
                onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
              >
                Dashboard
              </Link>
              <Link
                to="/explore"
                className="btn text-white me-3"
                style={buttonStyle}
                onMouseEnter={(e) => Object.assign(e.target.style, hoverStyle)}
                onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
              >
                Explore
              </Link>
              <Link
                to="/holdings"
                className="btn text-white me-3"
                style={buttonStyle}
                onMouseEnter={(e) => Object.assign(e.target.style, hoverStyle)}
                onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
              >
                Holdings
              </Link>
              <Link
                to="/profile"
                className="btn text-white me-3"
                style={buttonStyle}
                onMouseEnter={(e) => Object.assign(e.target.style, hoverStyle)}
                onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
              >
                Profile
              </Link>
              <Link
                to="/about"
                className="btn text-white me-3"
                style={buttonStyle}
                onMouseEnter={(e) => Object.assign(e.target.style, hoverStyle)}
                onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
              >
                About
              </Link>
            </>
          )}

          {/* Auth Buttons */}
          {isLoggedIn ? (
            <button
              className="btn text-white"
              style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
              onMouseEnter={(e) => Object.assign(e.target.style, hoverStyle)}
              onMouseLeave={(e) =>
                Object.assign(e.target.style, {
                  ...buttonStyle,
                  backgroundColor: "#dc3545",
                })
              }
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <div className="ms-3">
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
    </nav>
  );
};

export default Navbar;
