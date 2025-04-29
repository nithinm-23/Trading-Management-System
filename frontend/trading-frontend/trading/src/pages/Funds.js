import React, { useState, useEffect } from "react";
import axios from "axios";
import "./../styles/Funds.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Funds = () => {
  const [activeTab, setActiveTab] = useState("add");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const userId = JSON.parse(localStorage.getItem("user"))?.id;
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  const token = localStorage.getItem("authToken");
  // axios
  //   .get("http://localhost:8080/api/funds", {
  //     headers: { Authorization: Bearer ${token} },
  //   })
  //   .then((response) => console.log(response.data))
  //   .catch((error) => console.error("Funds API error:", error));

  // Fetch balance and transactions
  useEffect(() => {
    if (!userId) {
      console.error("No user ID found in localStorage");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch balance
        const balanceResponse = await axios.get(
          `http://localhost:8080/api/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBalance(balanceResponse.data.balance);

        // Fetch transactions
        const transactionsResponse = await axios.get(
          `http://localhost:8080/api/transactions/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTransactions(transactionsResponse.data);
      } catch (error) {
        console.error(
          "Error fetching data:",
          error.response?.data || error.message
        );
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, token]);

  const handleTransaction = async (type) => {
    if (!userId) {
      console.error("User ID is missing.");
      setError("User ID is missing.");
      return;
    }

    try {
      console.log("Starting transaction:", type, "Amount:", amount);
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError("Invalid amount entered.");
        return;
      }

      if (type === "withdraw" && parsedAmount > balance) {
        setError("Withdrawal amount cannot exceed available balance.");
        return;
      }

      const transactionType = type === "add" ? "ADD" : "WITHDRAW";

      // ✅ Optimistically update the balance before API call
      setBalance((prevBalance) =>
        type === "add" ? prevBalance + parsedAmount : prevBalance - parsedAmount
      );

      // Payment API call
      const paymentResponse = await axios.post(
        `http://localhost:8080/api/payment/process`, // Adjusted payment API endpoint
        {
          userId,
          amount: parsedAmount,
          type: transactionType,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Check for payment success
      if (paymentResponse.data.status === "SUCCESS") {
        // Fetch updated balance and transactions
        const updatedBalanceResponse = await axios.get(
          `http://localhost:8080/api/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBalance(updatedBalanceResponse.data.balance);

        const transactionsResponse = await axios.get(
          `http://localhost:8080/api/transactions/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTransactions(transactionsResponse.data);

        setAmount("");
        setError(null);
      } else {
        setError("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error(
        "Transaction error:",
        error.response?.data || error.message
      );
      setError(error.response?.data?.message || "Transaction failed");
    }
  };

  return (
    <div className="funds-container">
      <h2 className="funds-title">INR Balance</h2>
      <div className="funds-tabs">
        <button
          className={activeTab === "add" ? "active-tab" : ""}
          onClick={() => setActiveTab("add")}
        >
          Add Money
        </button>
        <button
          className={activeTab === "withdraw" ? "active-tab" : ""}
          onClick={() => setActiveTab("withdraw")}
        >
          Withdraw
        </button>
      </div>

      <div className="funds-content">
        <div className="funds-balance">
          <p>Stocks, F&O balance</p>
          <h1>₹{balance !== null ? balance.toFixed(2) : "Loading..."}</h1>
          <div className="balance-details">
            <p>Cash</p>
            <p>₹{balance !== null ? balance.toFixed(2) : "Loading..."}</p>
          </div>
        </div>

        <div className="funds-form">
          <label>Enter Amount</label>
          <div className="input-box">
            <span>₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0.01"
              step="0.01"
            />
          </div>
          <div className="preset-buttons">
            <button
              type="button"
              onClick={() => setAmount((prev) => (+prev || 0) + 100)}
            >
              + ₹100
            </button>
            <button
              type="button"
              onClick={() => setAmount((prev) => (+prev || 0) + 500)}
            >
              + ₹500
            </button>
          </div>
          <button
            className="submit-button"
            onClick={() =>
              navigate("/payment", {
                state: {
                  userId,
                  amount: parseFloat(amount),
                  type: activeTab === "add" ? "ADD" : "WITHDRAW",
                },
              })
            }
            disabled={!amount || parseFloat(amount) <= 0}
          >
            {activeTab === "add" ? "Add Money" : "Withdraw Money"}
          </button>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="transaction-history-section">
        <h3>Transaction History</h3>
        {loading ? (
          <p>Loading transactions...</p>
        ) : error ? (
          <p className="error-message">Error: {error}</p>
        ) : transactions.length === 0 ? (
          <p>No transactions found</p>
        ) : (
          <div className="transactions-list">
            {transactions
              .slice(
                (currentPage - 1) * transactionsPerPage,
                currentPage * transactionsPerPage
              )
              .map((tx) => (
                <div key={tx.id} className="transaction-item">
                  <div className="transaction-header">
                    <span
                      className={`transaction-type ${tx.type.toLowerCase()}`}
                    >
                      {tx.type}
                    </span>
                    <span
                      className={`transaction-amount ${
                        tx.type === "WITHDRAW" ? "negative" : "positive"
                      }`}
                      style={{
                        color: tx.type === "WITHDRAW" ? "red" : "green",
                      }}
                    >
                      {tx.type === "WITHDRAW" ? "-" : "+"}₹
                      {Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="transaction-details">
                    <span className="transaction-date">
                      {new Date(tx.timestamp).toLocaleString()}
                    </span>
                    <span className="transaction-description">
                      {tx.description}
                    </span>
                  </div>
                </div>
              ))}

            <div className="pagination">
              {currentPage > 1 && (
                <button
                  className="pagination-button prev-button" // Added classes
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1} // Good practice to disable when not applicable
                >
                  &laquo; Previous {/* Using HTML entity for arrow */}
                </button>
              )}
              {/* Optional: Display page numbers here if needed */}
              {currentPage * transactionsPerPage < transactions.length && (
                <button
                  className="pagination-button next-button" // Added classes
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={
                    currentPage * transactionsPerPage >= transactions.length
                  } // Disable when on last page
                >
                  Next &raquo; {/* Using HTML entity for arrow */}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Funds;
