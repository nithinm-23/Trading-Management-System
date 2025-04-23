// src/components/TransactionHistory.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/TransactionHistory.css";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `http://localhost:8080/api/transactions/record?userId=${userId}&amount=${amount}&type=${type}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setTransactions(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="transaction-history">
      <h3>Transaction History</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions
            .slice(
              (currentPage - 1) * transactionsPerPage,
              currentPage * transactionsPerPage
            )
            .map((tx) => (
              <tr key={tx.id}>
                <td>{new Date(tx.timestamp).toLocaleString()}</td>
                <td className={`type-${tx.type.toLowerCase()}`}>{tx.type}</td>
                <td className={tx.amount >= 0 ? "positive" : "negative"}>
                  {tx.amount >= 0 ? "+" : ""}
                  {tx.amount.toFixed(2)}
                </td>
                <td>{tx.description}</td>
                <td>{tx.status}</td>
              </tr>
            ))}
        </tbody>
      </table>

      <div className="pagination">
        {currentPage > 1 && (
          <button onClick={() => setCurrentPage(currentPage - 1)}>
            Previous
          </button>
        )}
        {currentPage * transactionsPerPage < transactions.length && (
          <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
