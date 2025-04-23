import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { amount, userId, type } = location.state || {};

  const [form, setForm] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardHolder: "",
  });

  const [loading, setLoading] = useState(false);
  const [cardType, setCardType] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      const numeric = value.replace(/\D/g, "").slice(0, 16);
      const formatted = numeric.replace(/(.{4})/g, "$1 ").trim();
      setForm({ ...form, [name]: formatted });
      detectCardType(numeric);
    } else if (name === "expiry") {
      let formatted = value.replace(/[^\d]/g, "").slice(0, 4);
      if (formatted.length >= 3) {
        formatted = formatted.replace(/(\d{2})(\d{1,2})/, "$1/$2");
      }
      setForm({ ...form, [name]: formatted });
    } else if (name === "cvv") {
      const numeric = value.replace(/\D/g, "").slice(0, 3);
      setForm({ ...form, [name]: numeric });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const detectCardType = (number) => {
    const cardPatterns = {
      Visa: /^4/,
      Mastercard: /^5[1-5]/,
      RuPay: /^(508[5-9]|6069|607|608|6521|6522)/,
    };

    if (cardPatterns.Visa.test(number)) setCardType("Visa");
    else if (cardPatterns.Mastercard.test(number)) setCardType("Mastercard");
    else if (cardPatterns.RuPay.test(number)) setCardType("RuPay");
    else setCardType("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8080/api/payment/process",
        {
          ...form,
          userId,
          amount,
          type,
        }
      );

      if (res.data.status === "SUCCESS") {
        Swal.fire({
          icon: "success",
          title: "Payment Successful!",
          showConfirmButton: false,
          timer: 1500,
        });

        setTimeout(() => {
          navigate("/payment/success");
        }, 1600);
      } else {
        Swal.fire({
          icon: "error",
          title: "Payment Failed",
          text: "Please try again.",
        });
        setTimeout(() => {
          navigate("/payment/failure");
        }, 1000);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: "Network error or invalid details",
      });
      setTimeout(() => {
        navigate("/payment/failure");
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const renderCardIcon = () => {
    switch (cardType) {
      case "Visa":
        return (
          <img
            src="https://img.icons8.com/color/48/000000/visa.png"
            alt="Visa"
          />
        );
      case "Mastercard":
        return (
          <img
            src="https://img.icons8.com/color/48/000000/mastercard-logo.png"
            alt="Mastercard"
          />
        );
      case "RuPay":
        return (
          <img
            src="https://images.seeklogo.com/logo-png/25/2/rupay-logo-png_seeklogo-256357.png"
            alt="RuPay"
            height="64"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <h4 className="text-center mb-3">Secure Payment</h4>

        <div className="text-center mb-3">{renderCardIcon()}</div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Cardholder Name</label>
            <input
              type="text"
              className="form-control"
              name="cardHolder"
              placeholder="John Doe"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Card Number</label>
            <input
              type="text"
              className="form-control"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={form.cardNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="d-flex gap-2 mb-3">
            <div>
              <label className="form-label">Expiry</label>
              <input
                type="text"
                className="form-control"
                name="expiry"
                placeholder="MM/YY"
                value={form.expiry}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="form-label">CVV</label>
              <input
                type="password"
                className="form-control"
                name="cvv"
                placeholder="123"
                value={form.cvv}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              <>Pay ₹{amount}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
