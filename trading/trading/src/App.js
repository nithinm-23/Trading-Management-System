import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";
import Funds from "./pages/Funds";
import { ToastContainer } from "react-toastify";
import AllStocks from "./pages/AllStocks";
import Holdings from "./pages/Holdings";
import Footer from "./components/Footer";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ProfileComplete from "./pages/ProfileComplete";
import axios from "axios";
import { useEffect } from "react";
import { setAuthToken } from "./utils/auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Chatbot from "./components/Chatbot";
import VerifyMobile from "./pages/VerifyMobile";
import VerifyEmail from "./pages/VerifyEmail";
import Payment from "./pages/PaymentPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
// Wrapper component to handle Navbar visibility
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarOn = [
    "/",
    "/signup",
    "/complete-profile",
    "/verify-email",
    "/verify-mobile",
  ];

  const token = localStorage.getItem("authToken");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  return (
    <>
      {!hideNavbarOn.includes(location.pathname) && <Navbar />}
      {children}
    </>
  );
};

function App() {
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setAuthToken(token);
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        <ToastContainer />
        <Layout>
          <Routes>
            <Route path="/" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/about" element={<Home />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/explore"
              element={
                <ProtectedRoute>
                  <Explore />
                </ProtectedRoute>
              }
            />
            <Route
              path="/holdings"
              element={
                <ProtectedRoute>
                  <Holdings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/funds"
              element={
                <ProtectedRoute>
                  <Funds />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/success"
              element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/failure"
              element={
                <ProtectedRoute>
                  <PaymentFailure /> {/* Add this for the payment flow */}
                </ProtectedRoute>
              }
            />
            <Route
              path="/all-stocks"
              element={
                <ProtectedRoute>
                  <AllStocks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complete-profile"
              element={
                <ProtectedRoute>
                  <ProfileComplete />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verify-mobile"
              element={
                <ProtectedRoute>
                  <VerifyMobile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verify-email"
              element={
                <ProtectedRoute>
                  <VerifyEmail />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
      <Chatbot />
    </GoogleOAuthProvider>
  );
}

export default App;
