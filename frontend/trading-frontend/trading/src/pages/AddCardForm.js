import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaCreditCard, FaUser, FaCalendarAlt, FaLock } from "react-icons/fa";

const AddCardForm = ({ userId, onCardAdded }) => {
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
      // Format card number with spaces every 4 digits
      const numeric = value.replace(/\D/g, "").slice(0, 16);
      const formatted = numeric.replace(/(.{4})/g, "$1 ").trim();
      setForm({ ...form, [name]: formatted });
      detectCardType(numeric);
    } else if (name === "expiry") {
      // Format expiry date as MM/YY
      let formatted = value.replace(/[^\d]/g, "").slice(0, 4);
      if (formatted.length >= 2) {
        formatted = formatted.replace(/(\d{2})(\d{0,2})/, "$1/$2");
      }
      setForm({ ...form, [name]: formatted });
    } else if (name === "cvv") {
      // Limit CVV to 3-4 digits
      const numeric = value.replace(/\D/g, "").slice(0, 4);
      setForm({ ...form, [name]: numeric });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const detectCardType = (number) => {
    const cardPatterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      discover: /^6(?:011|5)/,
      rupay: /^(508[5-9]|6069|607|608|6521|6522)/,
    };

    if (cardPatterns.visa.test(number)) setCardType("visa");
    else if (cardPatterns.mastercard.test(number)) setCardType("mastercard");
    else if (cardPatterns.discover.test(number)) setCardType("discover");
    else if (cardPatterns.rupay.test(number)) setCardType("rupay");
    else setCardType("");
  };

  const getCardIcon = () => {
    switch (cardType) {
      case "visa":
        return (
          <img
            src="https://img.icons8.com/color/48/000000/visa.png"
            alt="Visa"
            className="card-icon"
          />
        );
      case "mastercard":
        return (
          <img
            src="https://img.icons8.com/color/48/000000/mastercard.png"
            alt="Mastercard"
            className="card-icon"
          />
        );
      case "discover":
        return (
          <img
            src="https://img.icons8.com/color/48/000000/discover.png"
            alt="Discover"
            className="card-icon"
          />
        );
      case "rupay":
        return (
          <img
            src="https://img.icons8.com/color/48/000000/rupee.png"
            alt="RuPay"
            className="card-icon"
          />
        );
      default:
        return <FaCreditCard className="text-muted" size={24} />;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate expiry date format (MM/YY)
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Expiry Date",
        text: "Please enter expiry date in MM/YY format",
      });
      setLoading(false);
      return;
    }

    const [expiryMonth, expiryYear] = form.expiry.split("/");
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    // Validate expiry date is in future
    if (
      parseInt(expiryYear) < currentYear ||
      (parseInt(expiryYear) === currentYear &&
        parseInt(expiryMonth) < currentMonth)
    ) {
      Swal.fire({
        icon: "error",
        title: "Card Expired",
        text: "Please enter a valid future expiry date",
      });
      setLoading(false);
      return;
    }

    const fullExpiryYear = 2000 + parseInt(expiryYear, 10);
    const maxAllowedYear = new Date().getFullYear() + 10;

    if (fullExpiryYear > maxAllowedYear) {
      Swal.fire({
        icon: "error",
        title: "Invalid Expiry Date",
        text: `Expiry year can't be more than ${maxAllowedYear}. Please enter a valid expiry date.`,
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/payment/addCard",
        {
          userId,
          cardNumber: form.cardNumber.replace(/\s/g, ""),
          expiryMonth: parseInt(expiryMonth, 10),
          expiryYear: 2000 + parseInt(expiryYear, 10),
          cvv: form.cvv,
          cardHolderName: form.cardHolder,
          cardType,
        }
      );

      Swal.fire({
        icon: "success",
        title: "Card Saved!",
        text: "Your payment card has been added successfully",
        showConfirmButton: true,
      });

      if (typeof onCardAdded === "function") {
        onCardAdded(response.data);
      }

      // Reset form after successful submission
      setForm({
        cardNumber: "",
        expiry: "",
        cvv: "",
        cardHolder: "",
      });
      setCardType("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "Failed to save card. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white border-bottom-0 pb-2">
        <h5 className="mb-0 fw-semibold">Add Payment Method</h5>
      </div>
      <div className="card-body pt-1">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label small mb-1 pb-2">
              CARDHOLDER NAME
            </label>
            <div className="input-group">
              <span
                className="input-group-text bg-light border-end-0"
                style={{ height: 45 }}
              >
                <FaUser className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-2"
                name="cardHolder"
                placeholder="Full name on card"
                onChange={handleChange}
                value={form.cardHolder}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small mb-1 pb-2">CARD NUMBER</label>
            <div className="input-group">
              <span
                className="input-group-text bg-light border-end-0"
                style={{ height: 45 }}
              >
                <FaCreditCard className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-2"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                onChange={handleChange}
                value={form.cardNumber}
                required
              />
              <span
                className="input-group-text bg-white border-start-0 ps-1 pe-2"
                style={{ height: 45 }}
              >
                {getCardIcon()}
              </span>
            </div>
          </div>

          <div className="row g-2 mb-4">
            <div className="col-md-6">
              <label className="form-label small  mb-1 pb-2">EXPIRY DATE</label>
              <div className="input-group">
                <span
                  className="input-group-text bg-light border-end-0"
                  style={{ height: 45 }}
                >
                  <FaCalendarAlt className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-2"
                  name="expiry"
                  placeholder="MM/YY"
                  onChange={handleChange}
                  value={form.expiry}
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label small mb-1 pb-2">CVV</label>
              <div className="input-group">
                <span
                  className="input-group-text bg-light border-end-0"
                  style={{ height: 45 }}
                >
                  <FaLock className="text-muted" />
                </span>
                <input
                  type="password"
                  className="form-control border-start-0 ps-2"
                  name="cvv"
                  placeholder="•••"
                  onChange={handleChange}
                  value={form.cvv}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Processing...
              </>
            ) : (
              "Save Card"
            )}
          </button>
        </form>

        <div className="d-flex align-items-center justify-content-center mt-3">
          <img
            src="https://img.icons8.com/color/24/000000/visa.png"
            alt="Visa"
            className="mx-2"
          />
          <img
            src="https://img.icons8.com/color/24/000000/mastercard.png"
            alt="Mastercard"
            className="mx-2"
          />
          <img
            src="https://img.icons8.com/color/24/000000/discover.png"
            alt="Discover"
            className="mx-2"
          />
        </div>
      </div>
    </div>
  );
};

export default AddCardForm;
