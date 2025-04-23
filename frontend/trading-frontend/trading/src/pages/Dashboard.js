import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  VictoryChart,
  VictoryCandlestick,
  VictoryAxis,
  VictoryTooltip,
  VictoryLine,
} from "victory";
import {
  List,
  Eye,
  Settings,
  TrendingUp,
  ChevronDown,
  Search,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const stocksList = [
  { symbol: "TCS.BSE", name: "Tata Consultancy Services", change: 1.2 },
  { symbol: "RELIANCE.BSE", name: "Reliance Industries", change: -0.37 },
  { symbol: "INFY.BSE", name: "Infosys", change: 0.82 },
  { symbol: "WIPRO.NSE", name: "Wipro Limited", change: 0.37 },
  { symbol: "HDFC.BSE", name: "HDFC Bank", change: -0.26 },
  { symbol: "AXISBANK.BSE", name: "Axis Bank", change: 0.65 },
  { symbol: "ICICIBANK.BSE", name: "ICICI Bank", change: 0.47 },
  { symbol: "KOTAKBANK.BSE", name: "Kotak Mahindra Bank", change: 1.21 },
  { symbol: "YESBANK.BSE", name: "Yes Bank", change: 0.77 },
  { symbol: "SBIN.BSE", name: "State Bank of India", change: 0.18 },
];

const Dashboard = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const stockSymbolFromURL = queryParams.get("stock");

  // State management
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStock, setSelectedStock] = useState(
    stockSymbolFromURL || stocksList[0].symbol
  );
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [currentStock, setCurrentStock] = useState(stocksList[0]);
  const [smaData, setSmaData] = useState([]);
  const [showSmaIndicator, setShowSmaIndicator] = useState(false);
  const [smaPeriod, setSmaPeriod] = useState(5);
  const [watchlists, setWatchlists] = useState([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState(null);
  const [watchlistStocks, setWatchlistStocks] = useState([]);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cost, setCost] = useState(0);
  const [balance, setBalance] = useState(0);
  const [currentRealPrice, setCurrentRealPrice] = useState(null);
  const [chartInitialized, setChartInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showIndicators, setShowIndicators] = useState(false);
  const [tradeType, setTradeType] = useState("buy");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeframe, setTimeframe] = useState("1M");

  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  // Filter stocks based on search query
  const filteredStocks = stocksList.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // API error handler
  const handleApiError = useCallback((error) => {
    console.error("API Error:", error);
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred";
    setError(message);
    return null;
  }, []);

  // Generate mock data for demonstration
  const generateMockData = useCallback((days) => {
    const data = [];
    const today = new Date();
    let price = 500 + Math.random() * 150;

    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const volatility = Math.random() * 30 - 15;
      const open = price;
      const close = price + volatility;
      const high = Math.max(open, close) + Math.random() * 15;
      const low = Math.min(open, close) - Math.random() * 15;

      data.push({
        x: date,
        open,
        high,
        low,
        close,
      });

      price = close;
    }
    return data;
  }, []);

  // Fetch stock data
  const fetchStockData = useCallback(
    async (symbol) => {
      setIsLoading(true);
      setError(null);

      try {
        // Replace with actual API call in production
        const days =
          timeframe === "1W"
            ? 7
            : timeframe === "1M"
            ? 30
            : timeframe === "3M"
            ? 90
            : 30;
        const mockData = generateMockData(days);
        setChartData(mockData);

        const allPrices = mockData.flatMap((d) => [
          d.open,
          d.high,
          d.low,
          d.close,
        ]);
        const minPrice = Math.min(...allPrices);
        const maxPrice = Math.max(...allPrices);

        setPriceRange([
          isNaN(minPrice) ? 900 : minPrice - 25,
          isNaN(maxPrice) ? 1100 : maxPrice + 25,
        ]);

        const stock =
          stocksList.find((s) => s.symbol === symbol) || stocksList[0];
        setCurrentStock(stock);

        if (showSmaIndicator) {
          calculateSMA(mockData, smaPeriod);
        }
      } catch (err) {
        handleApiError(err);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    },
    [generateMockData, handleApiError, showSmaIndicator, smaPeriod, timeframe]
  );

  // Calculate SMA
  const calculateSMA = useCallback((data, period) => {
    if (!data?.length || period <= 0 || period > data.length) {
      setSmaData([]);
      return;
    }

    const smaResult = [];
    let sum = 0;

    for (let i = 0; i < period; i++) {
      sum += data[i].close;
    }

    smaResult.push({
      x: data[period - 1].x,
      y: sum / period,
    });

    for (let i = period; i < data.length; i++) {
      sum = sum - data[i - period].close + data[i].close;
      smaResult.push({
        x: data[i].x,
        y: sum / period,
      });
    }

    setSmaData(smaResult);
  }, []);

  // Fetch watchlists
  const fetchWatchlists = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/watchlists/user/${userId}`
      );
      setWatchlists(response.data);
      if (response.data.length > 0) {
        setSelectedWatchlist(response.data[0].id);
      }
    } catch (error) {
      handleApiError(error);
    }
  }, [userId, handleApiError]);

  // Fetch watchlist stocks
  const fetchWatchlistStocks = useCallback(
    async (watchlistId) => {
      if (!watchlistId) return;
      try {
        const response = await axios.get(
          `http://localhost:8080/api/watchlists/${watchlistId}/stocks`
        );
        setWatchlistStocks(response.data);
      } catch (error) {
        handleApiError(error);
      }
    },
    [handleApiError]
  );

  // Handle buy/sell orders
  const handleTrade = async () => {
    try {
      if (!selectedStock) {
        throw new Error("No stock selected");
      }

      const response = await axios.post(
        `http://localhost:8080/api/trades/${tradeType}`,
        null,
        {
          params: {
            userId,
            symbol: selectedStock,
            quantity: Number(quantity),
          },
        }
      );

      // Get updated balance
      const balanceResponse = await axios.get(
        `http://localhost:8080/api/users/${userId}/balance`
      );
      setBalance(balanceResponse.data.balance);

      alert(
        `${tradeType} order placed successfully at ₹${response.data.price} per share!`
      );
    } catch (error) {
      console.error("Trade error:", error);
      alert(
        `Failed to place ${tradeType} order: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handle indicator selection
  const handleIndicatorSelect = (indicator) => {
    if (indicator === "SMA") {
      setShowSmaIndicator(!showSmaIndicator);
      if (!showSmaIndicator) {
        calculateSMA(chartData, smaPeriod);
      }
    }
  };

  // Get current price data
  const getCurrentPrice = () => {
    if (chartData.length === 0)
      return { price: "N/A", change: 0, percentChange: 0 };

    const lastDay = chartData[chartData.length - 1];
    const previousDay = chartData[chartData.length - 2] || lastDay;
    const price = lastDay.close;
    const change = lastDay.close - previousDay.close;
    const percentChange = (change / previousDay.close) * 100;

    return {
      price: price.toFixed(2),
      change: change.toFixed(2),
      percentChange: percentChange.toFixed(2),
    };
  };

  useEffect(() => {
    if (stockSymbolFromURL) {
      setSelectedStock(stockSymbolFromURL);
      fetchStockData(stockSymbolFromURL);
    }
  }, [stockSymbolFromURL]);

  // Initial data fetch
  useEffect(() => {
    fetchStockData(selectedStock);
    fetchWatchlists();

    const interval = setInterval(() => {
      fetchStockData(selectedStock);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchStockData, fetchWatchlists, selectedStock]);

  useEffect(() => {
    if (selectedStock) {
      fetchStockData(selectedStock);
    }
  }, [selectedStock, timeframe]);

  // Fetch stocks when watchlist changes
  useEffect(() => {
    if (selectedWatchlist) {
      fetchWatchlistStocks(selectedWatchlist);
    }
  }, [selectedWatchlist, fetchWatchlistStocks]);

  // Filtered data
  const filteredChartData = chartData.slice(-20);
  const tickValues = filteredChartData.map((d) => d.x);
  const currentPrice = getCurrentPrice();
  const filteredStocksList = showWatchlist ? watchlistStocks : filteredStocks;

  useEffect(() => {
    if (chartData.length > 0) {
      setCost((chartData[chartData.length - 1].close * quantity).toFixed(2));
    }
  }, [quantity, chartData]);

  return (
    <div
      className="d-flex vh-100 bg-dark text-light"
      style={{ overflow: "hidden" }}
    >
      {/* Left Panel - 25% */}
      <div
        className="w-25 bg-gray-900 border-end border-gray-700 d-flex flex-column"
        style={{ overflow: "hidden" }}
      >
        {/* Search Bar */}
        <div className="p-3 border-bottom border-gray-700">
          <div className="input-group">
            <span className="input-group-text bg-gray-800 border-gray-700">
              <Search className="text-black" size={16} />
            </span>
            <input
              type="text"
              placeholder="Search stocks..."
              className="text-black form-control bg-gray-800 border-gray-700 text-light"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        {/* <ul className="nav nav-tabs border-bottom border-gray-700">
          <li className="nav-item w-50">
            <button
              className={`nav-link w-100 ${
                activeTab === "all"
                  ? "active bg-gray-900 text-primary border-primary"
                  : "text-light"
              }`}
              onClick={() => setActiveTab("all")}
            >
              <List className="me-2" size={16} />
              All Stocks
            </button>
          </li>
          <li className="nav-item w-50">
            <button
              className={`nav-link w-100 ${
                activeTab === "watchlist"
                  ? "active bg-gray-900 text-primary border-primary"
                  : "text-light"
              }`}
              onClick={() => setActiveTab("watchlist")}
            >
              <Eye className="me-2" size={16} />
              Watchlists
            </button>
          </li>
        </ul> */}

        <ul className="nav nav-tabs border-bottom border-gray-700">
          <li className="nav-item w-50">
            <button
              className={`nav-link w-100 ${
                activeTab === "all"
                  ? "active bg-primary text-light border-primary"
                  : "text-light bg-gray-800 hover-bg-gray-700"
              }`}
              onClick={() => setActiveTab("all")}
            >
              <List className="me-2" size={16} />
              All Stocks
            </button>
          </li>
          <li className="nav-item w-50">
            <button
              className={`nav-link w-100 ${
                activeTab === "watchlist"
                  ? "active bg-primary text-light border-primary"
                  : "text-light bg-gray-800 hover-bg-gray-700"
              }`}
              onClick={() => setActiveTab("watchlist")}
            >
              <Eye className="me-2" size={16} />
              Watchlists
            </button>
          </li>
        </ul>

        {/* Content */}
        <div
          className="flex-grow-1"
          style={{
            overflowY: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {activeTab === "all" ? (
            <div className="p-2">
              {filteredStocksList.map((stock) => (
                <div
                  key={stock.symbol}
                  className={`d-flex justify-content-between align-items-center p-2 mb-1 rounded ${
                    selectedStock === stock.symbol
                      ? "bg-primary text-light"
                      : "bg-gray-900 hover-bg-gray-800 text-light"
                  } cursor-pointer`}
                  onClick={() => {
                    setSelectedStock(stock.symbol);
                    fetchStockData(stock.symbol);
                  }}
                >
                  <div className="d-flex align-items-center">
                    <div
                      className={`rounded p-1 me-2 ${
                        stock.change >= 0 ? "bg-success" : "bg-danger"
                      }`}
                      style={{
                        width: 30,
                        height: 30,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <TrendingUp size={16} className="text-light" />
                    </div>
                    <div>
                      <div className="fw-bold">
                        {stock.symbol.split(".")[0]}
                      </div>
                      <div className="small">{stock.name}</div>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold">
                      ₹
                      {chartData.length > 0
                        ? chartData[chartData.length - 1].close.toFixed(2)
                        : "N/A"}
                    </div>
                    <div
                      className={`small ${
                        stock.change >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {stock.change >= 0 ? "+" : ""}
                      {stock.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2">
              {watchlists.length > 0 ? (
                watchlists.map((watchlist) => (
                  <div key={watchlist.id} className="mb-2">
                    <button
                      className={`w-100 text-start p-2 rounded ${
                        selectedWatchlist === watchlist.id
                          ? "bg-gray-800"
                          : "bg-gray-900 hover-bg-gray-800"
                      }`}
                      onClick={() => setSelectedWatchlist(watchlist.id)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold">{watchlist.name}</span>
                        <ChevronDown className="" size={16} />
                      </div>
                    </button>
                    {selectedWatchlist === watchlist.id && (
                      <div className="mt-1 ms-3">
                        {watchlistStocks.length > 0 ? (
                          watchlistStocks.map((stock) => (
                            <div
                              key={stock.symbol}
                              className={`p-2 rounded mb-1 cursor-pointer ${
                                selectedStock === stock.symbol
                                  ? "bg-gray-800"
                                  : "bg-gray-900 hover-bg-gray-800"
                              }`}
                              onClick={() => {
                                setSelectedStock(stock.symbol);
                                fetchStockData(stock.symbol);
                              }}
                            >
                              {stock.symbol.split(".")[0]}
                            </div>
                          ))
                        ) : (
                          <div className="p-2 small">
                            No stocks in this watchlist
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-3 text-center">
                  <Eye size={24} className="mb-2" />
                  <p>No watchlists created yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - 75% */}
      <div className="w-75 d-flex flex-column bg-gray-900">
        {/* Chart Controls */}
        <div className="p-2 border-bottom border-gray-700 d-flex justify-content-between align-items-center">
          <div className="d-flex gap-2">
            <button
              className={`btn btn-sm ${
                timeframe === "1W" ? "btn-primary" : "btn-outline-secondary"
              }`}
              onClick={() => setTimeframe("1W")}
            >
              1W
            </button>
            <button
              className={`btn btn-sm ${
                timeframe === "1M" ? "btn-primary" : "btn-outline-secondary"
              }`}
              onClick={() => setTimeframe("1M")}
            >
              1M
            </button>
            <button
              className={`btn btn-sm ${
                timeframe === "3M" ? "btn-primary" : "btn-outline-secondary"
              }`}
              onClick={() => setTimeframe("3M")}
            >
              3M
            </button>
          </div>

          <div className="d-flex align-items-center gap-2">
            {showSmaIndicator && (
              <div className="d-flex align-items-center">
                <span className="me-2 small">SMA Period:</span>
                <select
                  className="text-black form-select form-select-sm bg-gray-800 border-gray-700 text-light"
                  value={smaPeriod}
                  onChange={(e) => {
                    const newPeriod = parseInt(e.target.value);
                    setSmaPeriod(newPeriod);
                    calculateSMA(chartData, newPeriod);
                  }}
                >
                  {[5, 10, 20, 50, 100].map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="dropdown position-relative">
              <button
                className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                onClick={() => setShowIndicators(!showIndicators)}
              >
                <Settings className="me-1" size={16} />
                Indicators
              </button>
              {showIndicators && (
                <div
                  className="dropdown-menu show bg-gray-800 border border-gray-700 p-2"
                  style={{
                    position: "absolute",
                    zIndex: 1000,
                    minWidth: "250px",
                    right: "0",
                    top: "100%",
                  }}
                >
                  <div
                    className="dropdown-item d-flex justify-content-between align-items-center p-2 rounded cursor-pointer hover-bg-gray-700"
                    onClick={() => handleIndicatorSelect("SMA")}
                  >
                    <span>Simple Moving Average (SMA)</span>
                    <div
                      className={`rounded-circle ${
                        showSmaIndicator ? "bg-primary" : "bg-secondary"
                      }`}
                      style={{ width: "16px", height: "16px" }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div
          className="flex-grow-1 p-3"
          style={{ height: "calc(100% - 150px)", overflow: "hidden" }}
        >
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="ms-2">Loading {selectedStock} chart...</span>
            </div>
          ) : (
            <div className="w-100 h-100 bg-gray-900 rounded">
              <VictoryChart
                scale={{ x: "time" }}
                domainPadding={{ x: 20 }}
                height={500}
                width={window.innerWidth * 0.75 - 40} // Responsive width
                padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
                style={{
                  background: { fill: "transparent" },
                  axis: { stroke: "#6c757d" },
                  grid: { stroke: "#495057" },
                }}
              >
                {/* X Axis */}
                <VictoryAxis
                  tickValues={tickValues}
                  tickFormat={(t) =>
                    new Date(t).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })
                  }
                  style={{
                    tickLabels: {
                      fontSize: 10,
                      padding: 5,
                      fill: "#adb5bd",
                    },
                    grid: {
                      stroke: "#495057",
                      strokeWidth: 1,
                    },
                  }}
                />

                {/* Y Axis */}
                <VictoryAxis
                  dependentAxis
                  domain={priceRange}
                  tickFormat={(t) => `₹${t.toFixed(0)}`}
                  style={{
                    tickLabels: {
                      fontSize: 10,
                      padding: 5,
                      fill: "#adb5bd",
                    },
                    grid: {
                      stroke: "#495057",
                      strokeWidth: 1,
                    },
                  }}
                />

                {/* Candlestick Chart */}
                <VictoryCandlestick
                  data={filteredChartData}
                  candleColors={{
                    positive: "#10b981",
                    negative: "#ef4444",
                  }}
                  candleWidth={10}
                  labels={({ datum }) =>
                    `Date: ${datum.x.toLocaleDateString()}\nOpen: ₹${datum.open.toFixed(
                      2
                    )}\nHigh: ₹${datum.high.toFixed(
                      2
                    )}\nLow: ₹${datum.low.toFixed(
                      2
                    )}\nClose: ₹${datum.close.toFixed(2)}`
                  }
                  labelComponent={
                    <VictoryTooltip
                      cornerRadius={0}
                      flyoutStyle={{
                        fill: "#1f2937",
                        stroke: "#374151",
                        strokeWidth: 1,
                      }}
                      style={{
                        fill: "#ffffff",
                        fontSize: 12,
                        fontFamily: "inherit",
                      }}
                    />
                  }
                />

                {/* SMA Indicator */}
                {showSmaIndicator && smaData.length > 0 && (
                  <VictoryLine
                    data={smaData}
                    style={{
                      data: {
                        stroke: "#3b82f6",
                        strokeWidth: 2,
                      },
                    }}
                    labels={({ datum }) =>
                      `SMA(${smaPeriod}): ₹${datum.y.toFixed(2)}`
                    }
                    labelComponent={
                      <VictoryTooltip
                        cornerRadius={0}
                        flyoutStyle={{
                          fill: "#1f2937",
                          stroke: "#3b82f6",
                          strokeWidth: 1,
                        }}
                        style={{
                          fill: "#ffffff",
                          fontSize: 12,
                          fontFamily: "inherit",
                        }}
                      />
                    }
                  />
                )}
              </VictoryChart>
            </div>
          )}
        </div>

        {/* Trading Controls */}
        <div className="p-3 border-top border-gray-700 bg-gray-800">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-3 align-items-center">
              <div>
                <label className="small mb-1">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="form-control form-control-sm bg-gray-700 border-gray-600 text-black"
                  min="1"
                  style={{ width: "100px" }}
                />
              </div>

              <div>
                <label className="small mb-1">Cost</label>
                <div
                  className="text-black form-control form-control-sm bg-gray-700 border-gray-600 text-light"
                  style={{ width: "120px" }}
                >
                  ₹{cost}
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                className={`btn btn-sm ${
                  tradeType === "buy"
                    ? "btn-success text-light"
                    : "btn-outline-secondary text-light"
                } hover-bg-success`}
                onClick={() => setTradeType("buy")}
                style={{ width: "100px" }}
              >
                Buy
              </button>
              <button
                className={`btn btn-sm ${
                  tradeType === "sell"
                    ? "btn-danger text-light"
                    : "btn-outline-secondary text-light"
                } hover-bg-danger`}
                onClick={() => setTradeType("sell")}
                style={{ width: "100px" }}
              >
                Sell
              </button>
              <button
                className={`btn btn-sm ${
                  tradeType === "buy" ? "btn-success" : "btn-danger"
                } text-light`}
                onClick={handleTrade}
                style={{ width: "120px" }}
              >
                {tradeType === "buy" ? "Place Buy Order" : "Place Sell Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
