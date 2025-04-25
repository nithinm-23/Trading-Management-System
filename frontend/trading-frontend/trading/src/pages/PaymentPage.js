import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "../styles/PaymentPage.css";
import "../styles/fade.css";
import {
  FaCreditCard,
  FaUser,
  FaCalendarAlt,
  FaLock,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import CardList from "./CardList";
import AddCardForm from "./AddCardForm";

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { amount, userId, type } = location.state || {};
  const [unmaskedCardNumber, setUnmaskedCardNumber] = useState("");
  const [fadeClass, setFadeClass] = useState("");
  const [showPage, setShowPage] = useState(false);

  useEffect(() => {
    // Show SweetAlert2 modal
    Swal.fire({
      title: "Redirecting to payment page...",
      text: "Please wait a moment",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      timer: 2500,
      didClose: () => {
        setShowPage(true); // Modal close hone ke baad content dikhana
      },
    });
  }, []);

  useEffect(() => {
    // Component mount hote hi fade-in class lagao
    setFadeClass("fade-in");
  }, []);

  const [form, setForm] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardHolder: "",
  });

  const [loading, setLoading] = useState(false);
  const [cardType, setCardType] = useState("");
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showAddCardForm, setShowAddCardForm] = useState(false);

  useEffect(() => {
    if (userId) {
      axios
        .get(`http://localhost:8080/api/payment/cards/${userId}`)
        .then((response) => {
          setSavedCards(response.data);
        })
        .catch((error) => {
          console.error("Error fetching saved cards:", error);
          setSavedCards([]);
        });
    }
  }, [userId]);

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

  const maskCardNumber = (number) => {
    if (!number) return "";
    return number.replace(/\d(?=\d{4})/g, "*");
  };

  const handleSelectCard = (card) => {
    if (
      card === null ||
      !savedCards.some((savedCard) => savedCard.id === card.id)
    ) {
      setSelectedCard(null);
      setForm({
        cardNumber: "",
        expiry: "",
        cvv: "",
        cardHolder: "",
      });
      setCardType("");
      return;
    }
    setSelectedCard(card);

    // Update the form fields with selected card
    setForm((prev) => ({
      ...prev,
      cardHolder: card.cardHolderName || "",
      cardNumber: maskCardNumber(card.cardNumber),
      expiry: `${String(card.expiryMonth).padStart(2, "0")}/${String(
        card.expiryYear
      ).slice(-2)}`,
      cardType: card.cardType || "",
      cvv: "", // Always empty for security
    }));
    setUnmaskedCardNumber(card.cardNumber);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const paymentData = selectedCard
        ? {
            userId,
            amount,
            type,
            cardNumber: selectedCard.cardNumber,
            expiryMonth: selectedCard.expiryMonth,
            expiryYear: selectedCard.expiryYear,
            cardHolderName: selectedCard.cardHolderName,
            cardType: selectedCard.cardType,
            saveCard: false, // since it's already saved
          }
        : {
            ...form,
            userId,
            amount,
            type,
            saveCard: form.saveCard || false, // if user checks "save card"
          };

      const res = await axios.post(
        "http://localhost:8080/api/payment/process",
        paymentData
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
          text: res.data.message || "Please try again.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: err.response?.data?.message || "Network error or invalid details",
      });
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
            className="card-brand-icon"
          />
        );
      case "Mastercard":
        return (
          <img
            src="https://img.icons8.com/color/48/000000/mastercard-logo.png"
            alt="Mastercard"
            className="card-brand-icon"
          />
        );
      case "RuPay":
        return (
          <img
            src="https://images.seeklogo.com/logo-png/25/2/rupay-logo-png_seeklogo-256357.png"
            alt="RuPay"
            className="card-brand-icon"
            style={{ height: "32px" }}
          />
        );
      case "Discover":
        return (
          <img
            src="https://img.icons8.com/color/24/000000/discover.png"
            alt="Discover"
            className="card-brand-icon"
            style={{ height: "32px" }}
          />
        );
      default:
        return (
          <FaCreditCard className="card-brand-icon text-muted" size={24} />
        );
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/payment/cards/${userId}`
      );
      setSavedCards(response.data); // Update the state with the new data
      setTimeout(() => {
        setLoading(false); // Set loading to false after 0.5 seconds
      }, 500);
    } catch (error) {
      console.error("Error refreshing cards:", error);
      Swal.fire("Error", "Failed to refresh payment details", "error");
    }
  };

  return (
    <div className={`payment-page-container ${showPage ? "fade-in" : ""}`}>
      {showPage && (
        <div className={`payment-page-container ${fadeClass}`}>
          <div className="payment-container">
            <div className="container">
              <div
                className="row justify-content-center"
                style={{ maxWidth: "100%" }}
              >
                <div className="col-lg-10">
                  <div className="payment-card">
                    <div className="payment-header">
                      <h2 className="payment-title">
                        <FaCreditCard className="me-2" />
                        Secure Payment
                      </h2>
                    </div>

                    <div className="payment-body">
                      <div className="row d-flex flex-wrap">
                        {/* Payment Section */}
                        <div className="col-md-6 payment-section">
                          <div className="payment-form-container">
                            <h3 className="section-title">
                              <span className="step-number">1</span>
                              Payment Details
                            </h3>

                            {/* Refresh Button */}
                            <button
                              className="btn btn-primary"
                              onClick={handleRefresh}
                              disabled={loading}
                            >
                              {loading ? "Refreshing..." : "Refresh Cards"}
                            </button>

                            {/* Spinner */}
                            {loading && (
                              <div className="spinner-container">
                                <div
                                  className="spinner-border spinner-border-custom"
                                  role="status"
                                >
                                  <span className="sr-only"></span>
                                </div>
                              </div>
                            )}

                            <div className="card-brand-display">
                              {renderCardIcon()}
                              {cardType && (
                                <span className="card-type-label">
                                  {cardType.charAt(0).toUpperCase() +
                                    cardType.slice(1)}
                                </span>
                              )}
                            </div>

                            {savedCards.length > 0 && (
                              <div className="mb-4">
                                <label className="form-label small text-uppercase">
                                  Use Saved Card
                                </label>
                                <select
                                  className="form-select saved-card-select"
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    // If value is empty, clear the selected card
                                    handleSelectCard(
                                      value ? JSON.parse(value) : null
                                    );
                                  }}
                                  value={
                                    selectedCard
                                      ? JSON.stringify(selectedCard)
                                      : ""
                                  }
                                >
                                  <option value="">Select a saved card</option>
                                  {savedCards.map((card) => (
                                    <option
                                      key={card.id}
                                      value={JSON.stringify(card)}
                                    >
                                      **** **** **** {card.cardNumber.slice(-4)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <form
                              onSubmit={handleSubmit}
                              className="payment-form"
                            >
                              <div className="form-group">
                                <label className="form-label small text-uppercase">
                                  Cardholder Name
                                </label>
                                <div className="input-with-icon">
                                  <FaUser className="input-icon" />
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="cardHolder"
                                    placeholder="Full name as on card"
                                    value={form.cardHolder}
                                    onChange={handleChange}
                                    required
                                    disabled={selectedCard}
                                  />
                                </div>
                              </div>

                              <div className="form-group">
                                <label className="form-label small text-uppercase">
                                  Card Number
                                </label>
                                <div className="input-with-icon">
                                  <FaCreditCard className="input-icon" />
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="cardNumber"
                                    placeholder="1234 5678 9012 3456"
                                    value={form.cardNumber}
                                    onChange={handleChange}
                                    required
                                    disabled={selectedCard}
                                  />
                                </div>
                              </div>

                              <div className="row">
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label className="form-label small text-uppercase">
                                      Expiry Date
                                    </label>
                                    <div className="input-with-icon">
                                      <FaCalendarAlt className="input-icon" />
                                      <input
                                        type="text"
                                        className="form-control"
                                        name="expiry"
                                        placeholder="MM/YY"
                                        value={form.expiry}
                                        onChange={handleChange}
                                        required
                                        disabled={selectedCard}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label className="form-label small text-uppercase">
                                      CVV
                                    </label>
                                    <div className="input-with-icon">
                                      <FaLock className="input-icon" />
                                      <input
                                        type="password"
                                        className="form-control"
                                        name="cvv"
                                        placeholder="•••"
                                        value={form.cvv}
                                        onChange={handleChange}
                                        required
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="submit"
                                className="btn btn-primary payment-button"
                                disabled={loading}
                              >
                                {loading ? (
                                  <>
                                    <span
                                      className="spinner-border spinner-border-sm me-2"
                                      role="status"
                                      aria-hidden="true"
                                    ></span>
                                    Processing Payment
                                  </>
                                ) : (
                                  `Pay ₹${amount}`
                                )}
                              </button>
                            </form>
                          </div>
                        </div>

                        {/* Card Management Section */}
                        <div className="col-md-6 card-management-section">
                          <div className="card-management-header">
                            <h3 className="section-title">
                              <span className="step-number">2</span>
                              Your Payment Methods
                            </h3>
                            <button
                              className={`btn btn-sm ${
                                showAddCardForm
                                  ? "btn-outline-danger"
                                  : "btn-outline-primary"
                              } toggle-card-form-btn`}
                              onClick={() =>
                                setShowAddCardForm(!showAddCardForm)
                              }
                            >
                              {showAddCardForm ? (
                                <>
                                  <FaTimes className="me-1" />
                                  Cancel
                                </>
                              ) : (
                                <>
                                  <FaPlus className="me-1" />
                                  Add Card
                                </>
                              )}
                            </button>
                          </div>

                          {showAddCardForm ? (
                            <AddCardForm
                              setSavedCards={setSavedCards}
                              userId={userId}
                              onSuccess={() => setShowAddCardForm(false)}
                            />
                          ) : (
                            <CardList
                              cards={savedCards}
                              userId={userId}
                              setSavedCards={setSavedCards}
                              selectedCard={selectedCard}
                              setSelectedCard={setSelectedCard}
                              setForm={setForm}
                              setCardType={setCardType}
                              onSelectCard={handleSelectCard}
                            />
                          )}

                          <div className="accepted-cards">
                            <p className="small mb-2">We accept:</p>
                            <div className="card-brands">
                              <img
                                src="https://img.icons8.com/color/30/000000/visa.png"
                                alt="Visa"
                              />
                              <img
                                src="https://img.icons8.com/color/30/000000/mastercard.png"
                                alt="Mastercard"
                              />
                              <img
                                src="https://img.icons8.com/color/30/000000/rupay.png"
                                alt="RuPay"
                              />
                              <img
                                src="https://img.icons8.com/color/24/000000/discover.png"
                                alt="Discover"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
