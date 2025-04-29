import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  RefreshCw,
  TrendingUp,
  DollarSign,
  BarChart3,
} from "lucide-react";
import Footer from "../components/Footer";
import SentimentMeter from "../components/news/SentimentMeter";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Explore.css";
import "../styles/news.css";

const Explore = () => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  let userId = storedUser
    ? JSON.parse(storedUser)?.id
    : localStorage.getItem("userId");

  // State management
  const [watchlists, setWatchlists] = useState([]);
  const [expandedWatchlist, setExpandedWatchlist] = useState(null);
  const [stocksData, setStocksData] = useState({});
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [allStocks, setAllStocks] = useState([]);
  const [topStocks, setTopStocks] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [totalReturns, setTotalReturns] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);

  // Fetch data functions
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/stocks")
      .then((response) => {
        setAllStocks(response.data);
        setTopStocks(getRandomStocks(response.data, 3));
      })
      .catch(console.error);

    // Fetch market news
    setLoadingNews(true);
    axios
      .get("http://localhost:8080/api/news/market")
      .then((response) => {
        setNews(response.data.articles || []);
      })
      .catch(console.error)
      .finally(() => setLoadingNews(false));
  }, []);

  useEffect(() => {
    if (!userId) return;
    axios
      .get(`http://localhost:8080/api/watchlists/user/${userId}`)
      .then((response) => setWatchlists(response.data))
      .catch(console.error);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const fetchHoldings = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/portfolio/user/${userId}`
        );
        setHoldings(response.data);
        const totals = response.data.reduce(
          (acc, holding) => {
            acc.investment += holding.purchasePrice * holding.quantity;
            acc.currentValue += holding.quantity * (holding.currentPrice || 0);
            return acc;
          },
          { investment: 0, currentValue: 0 }
        );
        setCurrentValue(totals.currentValue);
        setTotalReturns(totals.currentValue - totals.investment);
      } catch (error) {
        console.error("Error fetching holdings:", error);
      }
    };
    fetchHoldings();
  }, [userId]);

  // Helper functions
  const getRandomStocks = (stocks, count) => {
    return stocks?.length
      ? [...stocks].sort(() => 0.5 - Math.random()).slice(0, count)
      : [];
  };

  const fetchStocks = (watchlistId) => {
    if (!watchlistId) return;
    axios
      .get(`http://localhost:8080/api/watchlists/${watchlistId}/stocks`)
      .then((response) => {
        setStocksData((prev) => ({ ...prev, [watchlistId]: response.data }));
      })
      .catch(console.error);
  };

  const refreshNews = () => {
    setLoadingNews(true);
    axios
      .get("http://localhost:8080/api/news/market")
      .then((response) => {
        setNews(response.data.articles || []);
      })
      .catch(console.error)
      .finally(() => setLoadingNews(false));
  };

  // Action handlers
  const toggleWatchlist = (watchlistId) => {
    setExpandedWatchlist((prev) => (prev === watchlistId ? null : watchlistId));
    if (!stocksData[watchlistId]) fetchStocks(watchlistId);
  };

  const createWatchlist = () => {
    if (!newWatchlistName.trim()) return alert("Enter a watchlist name!");
    if (!userId) return alert("User ID missing. Please log in again.");

    axios
      .post(
        `http://localhost:8080/api/watchlists/create?userId=${userId}&name=${encodeURIComponent(
          newWatchlistName
        )}`
      )
      .then((response) => {
        setWatchlists((prev) => [...prev, response.data]);
        setNewWatchlistName("");
      })
      .catch((error) => {
        console.error("Error creating watchlist:", error);
        alert("Failed to create watchlist.");
      });
  };

  const deleteWatchlist = (watchlistId) => {
    axios
      .delete(`http://localhost:8080/api/watchlists/${watchlistId}`)
      .then(() => {
        setWatchlists((prev) => prev.filter((w) => w.id !== watchlistId));
        setExpandedWatchlist(null);
      })
      .catch(console.error);
  };

  const removeStockFromWatchlist = (watchlistId, stockSymbol) => {
    axios
      .delete(
        `http://localhost:8080/api/watchlists/${watchlistId}/stocks/${stockSymbol}`
      )
      .then(() => {
        setStocksData((prev) => ({
          ...prev,
          [watchlistId]: prev[watchlistId].filter(
            (stock) => stock.symbol !== stockSymbol
          ),
        }));
      })
      .catch(console.error);
  };

  return (
    <div className="bg-dark text-white min-vh-100">
      <div className="container-fluid py-4">
        {/* Market Overview Cards */}
        <div className="row g-4 mb-4">
          {[
            {
              icon: <BarChart3 className="text-primary" size={20} />,
              name: "NIFTY",
              value: "23,350.40",
              change: "+0.69%",
            },
            {
              icon: <TrendingUp className="text-info" size={20} />,
              name: "SENSEX",
              value: "76,905.51",
              change: "+0.73%",
            },
            {
              icon: <DollarSign className="text-warning" size={20} />,
              name: "BANKNIFTY",
              value: "50,593.55",
              change: "+1.06%",
            },
          ].map((item, index) => (
            <div key={index} className="col-md-4">
              <div className="card bg-dark border-secondary">
                <div className="card-body text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      {item.icon}
                      <span>{item.name}</span>
                    </div>
                    <div className="text-success">{item.change}</div>
                  </div>
                  <div className="mt-2 fs-4 fw-bold">{item.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Market News Section */}
        {/* <div className="card bg-dark border-secondary mb-4">
          <div className="card-body text-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="fs-4 fw-bold m-0">Market News</h2>
              <button
                className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
                onClick={refreshNews}
                disabled={loadingNews}
              >
                <RefreshCw size={16} />
                {loadingNews ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {loadingNews ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : news.length > 0 ? (
              <div className="horizontal-scroll-container">
                <div className="horizontal-scroll-wrapper d-flex flex-nowrap pb-3">
                  {news.map((article, index) => (
                    <div
                      key={index}
                      className="news-card-horizontal flex-shrink-0 me-3"
                    >
                      <div
                        className="card bg-dark border-secondary h-100"
                        style={{ width: "300px" }}
                      >
                        {article.urlToImage ? (
                          <img
                            src={article.urlToImage}
                            className="card-img-top"
                            alt={article.title}
                            style={{ height: "160px", objectFit: "cover" }}
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/300x160?text=No+Image";
                            }}
                          />
                        ) : (
                          <div
                            className="news-image-placeholder bg-secondary"
                            style={{ height: "160px" }}
                          >
                            <span>No Image Available</span>
                          </div>
                        )}
                        <div className="card-body">
                          <h5
                            className="card-title"
                            style={{ fontSize: "1rem", color: "white" }}
                          >
                            {article.title}
                          </h5>
                          <p
                            className="card-text"
                            style={{ fontSize: "0.85rem", color: "white" }}
                          >
                            {article.description?.substring(0, 80)}...
                          </p>
                        </div>
                        <div className="card-footer bg-dark border-secondary">
                          <small className="">
                            {new Date(article.publishedAt).toLocaleDateString()}{" "}
                            • {article.source?.name}
                          </small>
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary float-end"
                          >
                            Read
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted">No news available at the moment.</p>
            )}

            <div className="mt-4">
              <h2 className="fs-4 fw-bold mb-3">Market Sentiment</h2>
              <SentimentMeter articles={news} />
            </div>
          </div>
        </div> */}

        <div className="card bg-gradient border-0 shadow-lg mb-5">
          <div className="card-body text-white bg-dark">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fs-3 fw-bold text-light mb-0">📈 Market News</h2>
              <button
                className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
                onClick={refreshNews}
                disabled={loadingNews}
              >
                <RefreshCw size={16} />
                {loadingNews ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {loadingNews ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : news.length > 0 ? (
              <div
                className="horizontal-scroll-container overflow-auto px-1"
                style={{ scrollSnapType: "x mandatory" }}
              >
                <div
                  className="d-flex flex-nowrap gap-3 pb-3"
                  style={{ scrollBehavior: "smooth" }}
                >
                  {news.map((article, index) => (
                    <div
                      key={index}
                      className="news-card-horizontal flex-shrink-0"
                      style={{ width: "320px", scrollSnapAlign: "start" }}
                    >
                      <div className="card bg-dark border-secondary h-100 rounded-4 shadow-sm hover-highlight">
                        {article.urlToImage ? (
                          <img
                            src={article.urlToImage}
                            className="card-img-top rounded-top"
                            alt={article.title}
                            style={{ height: "180px", objectFit: "cover" }}
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/320x180?text=No+Image";
                            }}
                          />
                        ) : (
                          <div
                            className="bg-secondary text-white d-flex align-items-center justify-content-center"
                            style={{ height: "180px" }}
                          >
                            <span>No Image Available</span>
                          </div>
                        )}
                        <div className="card-body px-3 py-2">
                          <h5
                            className="card-title text-truncate"
                            title={article.title}
                            style={{ fontSize: "1rem", color: "#f8f9fa" }}
                          >
                            {article.title}
                          </h5>
                          <p
                            className="card-text small"
                            style={{ color: "white" }}
                          >
                            {article.description?.substring(0, 90)}...
                          </p>
                        </div>
                        <div className="card-footer d-flex justify-content-between align-items-center bg-dark border-secondary px-3 py-2">
                          <small className="text-secondary">
                            {new Date(article.publishedAt).toLocaleDateString()}{" "}
                            • {article.source?.name}
                          </small>
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            Read
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted">No news available at the moment.</p>
            )}

            <div className="mt-5">
              <h2 className="fs-4 fw-bold text-light mb-3">
                📊 Market Sentiment
              </h2>
              <SentimentMeter articles={news} />
            </div>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="card bg-dark border-secondary mb-4">
          <div className="card-body text-white">
            <h2 className="fs-4 fw-bold mb-4">Portfolio Overview</h2>
            <div className="row">
              <div className="col-md-6 mb-3 mb-md-0">
                <div className="mb-1">Total Returns</div>
                <div
                  className={`fs-3 fw-bold ${
                    totalReturns >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  ₹{totalReturns.toFixed(2)}
                  {totalReturns !== 0 &&
                    ` (${(
                      (totalReturns / (currentValue - totalReturns)) *
                      100
                    ).toFixed(2)}%)`}
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-1">Current Value</div>
                <div className="fs-3 fw-bold">₹{currentValue.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Stocks */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-4 text-white">
            <h2 className="fs-4 fw-bold m-0">Stocks</h2>
            <button
              className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
              onClick={() => setTopStocks(getRandomStocks(allStocks, 3))}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {topStocks.map((stock) => (
              <div key={stock.symbol} className="col">
                <div
                  className="card bg-dark border-secondary h-100 text-white hover-bg-gray-800 cursor-pointer"
                  onClick={() => navigate(`/dashboard?symbol=${stock.symbol}`)}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span
                        className="fw-bold text-wrap"
                        style={{ wordBreak: "break-word" }}
                      >
                        {stock.symbol}
                      </span>
                      <span
                        className={
                          stock.highPrice > stock.lowPrice
                            ? "text-success"
                            : "text-danger"
                        }
                      >
                        {stock.highPrice && stock.lowPrice
                          ? `${(
                              ((stock.highPrice - stock.lowPrice) /
                                stock.lowPrice) *
                              100
                            ).toFixed(2)}%`
                          : "N/A"}
                      </span>
                    </div>
                    <div
                      className="fs-3 fw-bold mb-1 text-wrap"
                      style={{ wordBreak: "break-word" }}
                    >
                      ₹{stock.closePrice?.toFixed(2) ?? "N/A"}
                    </div>
                    <div
                      className="text-wrap"
                      style={{ wordBreak: "break-word" }}
                    >
                      Volume:{" "}
                      {stock.volume
                        ? `${(stock.volume / 1000000).toFixed(1)}M`
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="col">
              <div
                className="card bg-dark border-secondary h-100 text-white hover-bg-gray-800 cursor-pointer"
                onClick={() => navigate("/all-stocks")}
              >
                <div className="card-body d-flex align-items-center justify-content-center">
                  <span
                    className="text-wrap"
                    style={{ wordBreak: "break-word" }}
                  >
                    View More →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Watchlists */}
        <div>
          <h2 className="fs-4 fw-bold mb-4 text-white">Watchlists</h2>
          <div className="d-flex flex-column gap-3">
            {watchlists.map((watchlist) => (
              <div key={watchlist.id} className="card bg-dark border-secondary">
                <div
                  className="card-header bg-gray-800 border-secondary d-flex justify-content-between align-items-center py-3 cursor-pointer text-white"
                  onClick={() => toggleWatchlist(watchlist.id)}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold">{watchlist.name}</span>
                    <span>{stocksData[watchlist.id]?.length || 0} stocks</span>
                  </div>
                  {expandedWatchlist === watchlist.id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>

                {expandedWatchlist === watchlist.id && (
                  <div className="card-body pt-0 text-white">
                    <div className="d-flex flex-column gap-3">
                      {stocksData[watchlist.id]?.length > 0 ? (
                        stocksData[watchlist.id].map((stock) => (
                          <div
                            key={stock.symbol}
                            className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary"
                          >
                            <span
                              className="fw-medium cursor-pointer hover-text-white"
                              onClick={() =>
                                navigate(`/dashboard?symbol=${stock.symbol}`)
                              }
                            >
                              {stock.symbol}
                            </span>
                            <div className="d-flex align-items-center gap-3">
                              <div className="text-end">
                                <div>
                                  ₹{stock.closePrice?.toFixed(2) ?? "N/A"}
                                </div>
                                <div
                                  className={
                                    stock.change >= 0
                                      ? "text-success"
                                      : "text-danger"
                                  }
                                >
                                  {stock.change >= 0 ? "+" : ""}
                                  {stock.percentageChange?.toFixed(2) ?? "0.00"}
                                  %
                                </div>
                              </div>
                              <button
                                className="btn btn-link text-danger p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeStockFromWatchlist(
                                    watchlist.id,
                                    stock.symbol
                                  );
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="py-2">No stocks in this watchlist.</p>
                      )}
                    </div>
                    <button
                      className="btn btn-outline-danger w-100 mt-3 d-flex align-items-center justify-content-center gap-2"
                      onClick={() => deleteWatchlist(watchlist.id)}
                    >
                      <Trash2 size={16} />
                      Delete Watchlist
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Create New Watchlist */}
            <div className="card bg-dark border-secondary">
              <div className="card-body text-white">
                <div className="d-flex gap-3">
                  <input
                    type="text"
                    placeholder="New Watchlist Name"
                    className="form-control bg-dark border-secondary text-white"
                    value={newWatchlistName}
                    onChange={(e) => setNewWatchlistName(e.target.value)}
                  />
                  <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={createWatchlist}
                  >
                    <Plus size={16} />
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Explore;
