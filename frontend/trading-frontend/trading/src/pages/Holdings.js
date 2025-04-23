import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingDown,
  Wallet,
  DollarSign,
  LineChart,
  AlertCircle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

const Holdings = () => {
  const navigate = useNavigate();
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [userFunds, setUserFunds] = useState(0);
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulatedPrices, setSimulatedPrices] = useState({});
  const [simulatedValue, setSimulatedValue] = useState(0);

  // Get user ID from local storage
  const storedUser = localStorage.getItem("user");
  const userId = storedUser
    ? JSON.parse(storedUser)?.id
    : localStorage.getItem("userId");

  // Fetch holdings data
  const fetchHoldings = async () => {
    if (!userId) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8080/api/portfolio/user/${userId}`
      );
      setHoldings(response.data);

      // Calculate totals
      const investmentTotal = response.data.reduce(
        (sum, item) => sum + item.purchasePrice * item.quantity,
        0
      );
      const currentTotal = response.data.reduce(
        (sum, item) => sum + (item.currentPrice || 0) * item.quantity,
        0
      );

      setTotalInvestment(investmentTotal);
      setCurrentValue(currentTotal);
      setLoading(false);

      // Initialize simulated prices with current prices
      const initialSimulatedPrices = {};
      response.data.forEach((item) => {
        initialSimulatedPrices[item.symbol] =
          item.currentPrice || item.purchasePrice;
      });
      setSimulatedPrices(initialSimulatedPrices);
    } catch (error) {
      console.error("Error fetching holdings:", error);
      setLoading(false);
    }
  };

  // Calculate simulated portfolio value
  useEffect(() => {
    if (simulationMode) {
      const simulatedTotal = holdings.reduce(
        (sum, item) =>
          sum +
          (simulatedPrices[item.symbol] || item.currentPrice || 0) *
            item.quantity,
        0
      );
      setSimulatedValue(simulatedTotal);
    }
  }, [simulatedPrices, holdings, simulationMode]);

  // Initial fetch and setup refresh
  useEffect(() => {
    fetchHoldings();

    // Set up interval for periodic refresh (every 30 seconds)
    const interval = setInterval(fetchHoldings, 30000);
    return () => clearInterval(interval);
  }, [userId, navigate, lastUpdate]);

  // Handle selling stock
  const handleSell = async (holdingId, symbol, quantity) => {
    if (
      window.confirm(
        `Are you sure you want to sell ${quantity} shares of ${symbol}?`
      )
    ) {
      try {
        console.log(`Selling ${quantity} shares of ${symbol}...`);

        // Call backend API to sell stocks
        const sellResponse = await axios.post(
          `http://localhost:8080/api/portfolio/sell/${userId}/${symbol}?quantity=${quantity}`
        );
        console.log("Sell Response:", sellResponse.data);

        // Fetch updated user balance from backend
        const balanceResponse = await axios.get(
          `http://localhost:8080/api/users/${userId}`
        );
        console.log("Updated Balance Response:", balanceResponse.data);

        if (balanceResponse.data.balance !== undefined) {
          setUserFunds(balanceResponse.data.balance);
        } else {
          console.error("Error: Balance not found in response");
        }

        // Update local holdings state
        setHoldings((prev) => {
          const updated = prev
            .map((item) =>
              item.id === holdingId
                ? { ...item, quantity: item.quantity - quantity }
                : item
            )
            .filter((item) => item.quantity > 0); // Remove if quantity becomes 0
          return updated;
        });

        setLastUpdate(Date.now()); // Trigger re-fetch
        alert(`${quantity} shares of ${symbol} sold successfully!`);
      } catch (error) {
        console.error(
          "Error selling stock:",
          error.response ? error.response.data : error
        );
        alert("Failed to sell stock");
      }
    }
  };

  // Handle price change in simulation
  const handlePriceChange = (symbol, value) => {
    setSimulatedPrices((prev) => ({
      ...prev,
      [symbol]: parseFloat(value),
    }));
  };

  // Toggle simulation mode
  const toggleSimulation = () => {
    setSimulationMode(!simulationMode);
    if (!simulationMode) {
      setSimulatedValue(currentValue);
    }
  };

  const totalReturns = currentValue - totalInvestment;
  const returnsPercentage =
    ((currentValue - totalInvestment) / totalInvestment) * 100;

  if (loading) {
    return (
      <div className="container-fluid bg-dark min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-white">Loading your portfolio...</div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-dark text-light min-vh-100 py-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <LineChart className="text-primary me-3" size={32} />
            <h1
              className="text-gradient m-0"
              style={{
                background: "linear-gradient(to right, #8b5cf6, #d946ef)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Portfolio Overview
            </h1>
          </div>
          <div>
            <button
              className={`btn btn-sm me-2 ${
                simulationMode ? "btn-danger" : "btn-info"
              }`}
              onClick={toggleSimulation}
            >
              {simulationMode ? "Exit Simulation" : "What-If Scenario"}
            </button>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => {
                fetchHoldings();
                setLastUpdate(Date.now());
              }}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Summary Cards - Always visible but updated in simulation mode */}
        <div className="row mb-4 g-4">
          <div className="col-md-4">
            <div className="card bg-dark border-secondary h-100">
              <div className="card-body">
                <div
                  className="d-flex justify-content-between align-items-center"
                  style={{ color: "White" }}
                >
                  <div>
                    <h6 className="mb-2">Total Investment</h6>
                    <h3 className="text-white">
                      ₹{totalInvestment.toFixed(2)}
                    </h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <Wallet className="text-primary" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div
              className="card bg-dark border-secondary h-100"
              style={{ width: "max-content" }}
            >
              <div className="card-body">
                <div
                  className="d-flex justify-content-between align-items-center"
                  style={{ color: "white" }}
                >
                  <div>
                    <h6 className="mb-2">
                      {simulationMode ? "Simulated Value" : "Current Value"}
                    </h6>
                    <h3 className="text-white">
                      ₹
                      {(simulationMode ? simulatedValue : currentValue).toFixed(
                        2
                      )}
                    </h3>
                  </div>
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <DollarSign className="text-success" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div
              className="card bg-dark border-secondary h-100"
              style={{ width: "max-content" }}
            >
              <div className="card-body">
                <div
                  className="d-flex justify-content-between align-items-center"
                  style={{ color: "white" }}
                >
                  <div>
                    <h6 className="mb-2">Total Returns</h6>
                    <div className="d-flex align-items-center">
                      <h3
                        className={`m-0 ${
                          (simulationMode ? simulatedValue : currentValue) >=
                          totalInvestment
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        ₹
                        {Math.abs(
                          (simulationMode ? simulatedValue : currentValue) -
                            totalInvestment
                        ).toFixed(2)}
                      </h3>
                      <span
                        className={`ms-2 ${
                          (simulationMode ? simulatedValue : currentValue) >=
                          totalInvestment
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        (
                        {(
                          (((simulationMode ? simulatedValue : currentValue) -
                            totalInvestment) /
                            totalInvestment) *
                          100
                        ).toFixed(2)}
                        %)
                      </span>
                    </div>
                  </div>
                  <div
                    className={`rounded-circle p-3 ${
                      (simulationMode ? simulatedValue : currentValue) >=
                      totalInvestment
                        ? "bg-success bg-opacity-10"
                        : "bg-danger bg-opacity-10"
                    }`}
                  >
                    {(simulationMode ? simulatedValue : currentValue) >=
                    totalInvestment ? (
                      <TrendingUp className="text-success" size={24} />
                    ) : (
                      <TrendingDown className="text-danger" size={24} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simulation Controls - Only visible in simulation mode */}
        {simulationMode ? (
          <>
            <div className="card bg-dark border-secondary mb-4">
              <div
                className="card-header bg-gray-800 border-secondary d-flex justify-content-between align-items-center"
                style={{ color: "white" }}
              >
                <h5 className="mb-0">Price Simulation Controls</h5>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  style={{ color: "white" }}
                  onClick={() => {
                    const resetPrices = {};
                    holdings.forEach((item) => {
                      resetPrices[item.symbol] =
                        item.currentPrice || item.purchasePrice;
                    });
                    setSimulatedPrices(resetPrices);
                  }}
                >
                  Reset Prices
                </button>
              </div>
              <div className="card-body" style={{ color: "white" }}>
                <div className="">
                  {holdings.map((holding) => {
                    const currentPrice =
                      holding.currentPrice || holding.purchasePrice;
                    return (
                      <div key={`sim-${holding.symbol}`} className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="fw-bold">{holding.symbol}</span>
                          <span>
                            ₹
                            {(
                              simulatedPrices[holding.symbol] || currentPrice
                            ).toFixed(2)}
                          </span>
                        </div>
                        <input
                          type="range"
                          className="form-range"
                          min={Math.max(0, currentPrice * 0.1)}
                          max={currentPrice * 2}
                          step="0.1"
                          value={
                            simulatedPrices[holding.symbol] || currentPrice
                          }
                          onChange={(e) =>
                            handlePriceChange(holding.symbol, e.target.value)
                          }
                        />
                        <div className="d-flex justify-content-between small">
                          <span>-90% (₹{(currentPrice * 0.1).toFixed(2)})</span>
                          <span>Current (₹{currentPrice.toFixed(2)})</span>
                          <span>+100% (₹{(currentPrice * 2).toFixed(2)})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Holdings Table - Only visible when not in simulation mode */
          <div className="card bg-dark border-secondary">
            <div
              className="card-header border-secondary"
              style={{ color: "white" }}
            >
              <h2 className="h5 m-0">Your Holdings</h2>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-dark table-hover m-0">
                  <thead>
                    <tr>
                      <th className="text-uppercase small fw-bold">Stock</th>
                      <th className="text-uppercase small fw-bold">
                        Avg. Buy Price
                      </th>
                      <th className="text-uppercase small fw-bold">Quantity</th>
                      <th className="text-uppercase small fw-bold">
                        Invested Amount
                      </th>
                      <th className="text-uppercase small fw-bold">
                        Current Price
                      </th>
                      <th className="text-uppercase small fw-bold">
                        Current Value
                      </th>
                      <th className="text-uppercase small fw-bold">P&L</th>
                      <th className="text-uppercase small fw-bold">
                        Purchase Date
                      </th>
                      <th className="text-uppercase small fw-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.length > 0 ? (
                      holdings.map((holding) => {
                        const currentPrice = simulationMode
                          ? simulatedPrices[holding.symbol] ||
                            holding.currentPrice ||
                            holding.purchasePrice
                          : holding.currentPrice || holding.purchasePrice;

                        const investedAmount =
                          holding.purchasePrice * holding.quantity;
                        const currentVal = currentPrice * holding.quantity;
                        const profitLoss = currentVal - investedAmount;
                        const profitLossPercent =
                          (profitLoss / investedAmount) * 100;

                        return (
                          <tr key={holding.id}>
                            <td>
                              <strong>{holding.symbol}</strong>
                            </td>
                            <td>₹{holding.purchasePrice.toFixed(2)}</td>
                            <td>{holding.quantity}</td>
                            <td>₹{investedAmount.toFixed(2)}</td>
                            <td>₹{currentPrice.toFixed(2)}</td>
                            <td>₹{currentVal.toFixed(2)}</td>
                            <td>
                              <div
                                className={`d-flex align-items-center ${
                                  profitLoss >= 0
                                    ? "text-success"
                                    : "text-danger"
                                }`}
                              >
                                {profitLoss >= 0 ? (
                                  <ArrowUpCircle className="me-1" size={16} />
                                ) : (
                                  <ArrowDownCircle className="me-1" size={16} />
                                )}
                                <span>₹{Math.abs(profitLoss).toFixed(2)}</span>
                                <span className="ms-1">
                                  ({profitLossPercent.toFixed(2)}%)
                                </span>
                              </div>
                            </td>
                            <td>
                              {new Date(
                                holding.purchaseDate
                              ).toLocaleDateString()}
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  onClick={() =>
                                    handleSell(
                                      holding.id,
                                      holding.symbol,
                                      holding.quantity
                                    )
                                  }
                                  className="btn btn-sm btn-danger"
                                >
                                  Sell All
                                </button>
                                {holding.quantity > 1 && (
                                  <button
                                    onClick={() => {
                                      const qty = prompt(
                                        `Enter quantity to sell (max ${holding.quantity}):`,
                                        Math.floor(holding.quantity / 2)
                                      );
                                      if (qty && !isNaN(qty)) {
                                        const quantityToSell = parseInt(qty);
                                        if (
                                          quantityToSell > 0 &&
                                          quantityToSell <= holding.quantity
                                        ) {
                                          handleSell(
                                            holding.id,
                                            holding.symbol,
                                            quantityToSell
                                          );
                                        } else {
                                          alert(
                                            `Please enter a valid quantity between 1 and ${holding.quantity}`
                                          );
                                        }
                                      }
                                    }}
                                    className="btn btn-sm btn-warning"
                                  >
                                    Partial Sell
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center py-5">
                          <div className="d-flex flex-column align-items-center">
                            <AlertCircle size={48} className="mb-3" />
                            <h5 className="">No Holdings Found</h5>
                            <p className="small">
                              You don't have any holdings yet. Buy stocks to see
                              them here.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Holdings;
