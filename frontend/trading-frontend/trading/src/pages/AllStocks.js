import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { Modal, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Search,
  Plus,
  ArrowUp,
  ArrowDown,
  BarChart,
  ExclamationCircle,
} from "react-bootstrap-icons";

const AllStocks = () => {
  const [stocks, setStocks] = useState([]);
  const [watchlists, setWatchlists] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedWatchlist, setSelectedWatchlist] = useState("");
  const [modalShow, setModalShow] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef();
  const navigate = useNavigate();

  // Fetch user ID from local storage
  const storedUser = localStorage.getItem("user");
  let userId = storedUser
    ? JSON.parse(storedUser)?.id
    : localStorage.getItem("userId");

  // Fetch watchlists
  useEffect(() => {
    if (userId) {
      axios
        .get(`http://localhost:8080/api/watchlists/user/${userId}`)
        .then((res) => {
          console.log("Watchlists API Response:", res.data);
          setWatchlists(Array.isArray(res.data) ? res.data : []);
        })
        .catch((err) => {
          console.error("Error fetching watchlists:", err);
          setWatchlists([]);
        });
    }
  }, [userId]);

  // Fetch stocks with search and pagination
  const fetchStocks = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const response = await axios.get("http://localhost:8080/api/stocks", {
        params: {
          search: searchTerm,
          page: reset ? 1 : page,
          limit: 20 // Adjust this number based on your API
        }
      });

      const newStocks = Array.isArray(response.data) ? response.data : [];
      
      if (reset) {
        setStocks(newStocks);
        setHasMore(newStocks.length > 0);
      } else {
        setStocks(prevStocks => [...prevStocks, ...newStocks]);
        setHasMore(newStocks.length > 0);
      }
    } catch (err) {
      console.error("Error fetching stocks:", err);
      toast.error("Failed to load stocks");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchTerm, page]);

  // Initial load and search term changes
  useEffect(() => {
    fetchStocks(true);
  }, [searchTerm]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchStocks();
    }
  }, [page]);

  // Infinite scroll observer
  const lastStockElementRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  // Open modal to add stock to a watchlist
  const openModal = (stock, e) => {
    e.stopPropagation();
    setSelectedStock(stock);
    setModalShow(true);
  };

  // Handle adding stock to a watchlist
  const addToWatchlist = () => {
    if (!selectedWatchlist) {
      toast.warning("Please select a watchlist!");
      return;
    }

    axios
      .post(
        `http://localhost:8080/api/watchlists/${selectedWatchlist}/stocks/${selectedStock.symbol}`
      )
      .then(() => {
        toast.success(`Added ${selectedStock.symbol} to the watchlist!`);
        setModalShow(false);
      })
      .catch((err) => {
        console.error("Error adding stock:", err);
        toast.error("Failed to add stock.");
      });
  };

  // Sorting function
  const sortStocks = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedData = [...stocks].sort((a, b) => {
      let valA, valB;
      if (key === "percentChange") {
        valA =
          a.lowPrice && a.highPrice
            ? ((a.highPrice - a.lowPrice) / a.lowPrice) * 100
            : 0;
        valB =
          b.lowPrice && b.highPrice
            ? ((b.highPrice - b.lowPrice) / b.lowPrice) * 100
            : 0;
      } else {
        valA = a[key] ?? 0;
        valB = b[key] ?? 0;
      }
      return direction === "asc" ? valA - valB : valB - valA;
    });

    setSortConfig({ key, direction });
    setStocks(sortedData);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? (
        <ArrowUp className="ms-1" />
      ) : (
        <ArrowDown className="ms-1" />
      );
    }
    return null;
  };

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchStocks(true);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="container-fluid bg-dark min-vh-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid bg-dark text-light min-vh-100 p-4">
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <div>
            <div className="d-flex align-items-center mb-2">
              <BarChart className="text-primary me-3" size={28} />
              <h1 className="text-primary m-0">Market Overview</h1>
            </div>
          </div>
          <div className="mt-3 mt-md-0 w-100 w-md-auto">
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-light">
                <Search />
              </span>
              <input
                type="text"
                className="form-control bg-dark border-secondary text-light"
                placeholder="Search stocks by symbol or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Stocks Table */}
        <div className="card bg-dark border-secondary">
          <div
            className="card-header border-secondary"
            style={{ color: "white" }}
          >
            <h2 className="h5 m-0">All Stocks</h2>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead className="table-secondary">
                  <tr>
                    <th
                      onClick={() => sortStocks("symbol")}
                      className="cursor-pointer"
                    >
                      <div className="d-flex align-items-center">
                        Stock
                        {getSortIcon("symbol")}
                      </div>
                    </th>
                    <th
                      onClick={() => sortStocks("closePrice")}
                      className="cursor-pointer text-end"
                    >
                      <div className="d-flex align-items-center justify-content-end">
                        Market Price
                        {getSortIcon("closePrice")}
                      </div>
                    </th>
                    <th
                      onClick={() => sortStocks("lowPrice")}
                      className="cursor-pointer text-end"
                    >
                      <div className="d-flex align-items-center justify-content-end">
                        1 Day Low
                        {getSortIcon("lowPrice")}
                      </div>
                    </th>
                    <th
                      onClick={() => sortStocks("highPrice")}
                      className="cursor-pointer text-end"
                    >
                      <div className="d-flex align-items-center justify-content-end">
                        1 Day High
                        {getSortIcon("highPrice")}
                      </div>
                    </th>
                    <th
                      onClick={() => sortStocks("percentChange")}
                      className="cursor-pointer text-end"
                    >
                      <div className="d-flex align-items-center justify-content-end">
                        % Change
                        {getSortIcon("percentChange")}
                      </div>
                    </th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.length > 0 ? (
                    stocks.map((stock, index) => {
                      const percentChange =
                        stock.lowPrice && stock.highPrice
                          ? ((stock.highPrice - stock.lowPrice) /
                              stock.lowPrice) *
                            100
                          : 0;

                      if (stocks.length === index + 1) {
                        return (
                          <tr
                            ref={lastStockElementRef}
                            key={stock.symbol}
                            onClick={() =>
                              navigate(`/dashboard?stock=${stock.symbol}`)
                            }
                            className="cursor-pointer"
                          >
                            <td>
                              <div className="d-flex align-items-center justify-content-between">
                                <strong>{stock.symbol}</strong>
                              </div>
                            </td>
                            <td className="text-end">
                              ₹{stock.closePrice?.toFixed(2)}
                            </td>
                            <td className="text-end">
                              ₹{stock.lowPrice?.toFixed(2)}
                            </td>
                            <td className="text-end">
                              ₹{stock.highPrice?.toFixed(2)}
                            </td>
                            <td className="text-end">
                              <div
                                className={`d-inline-block ${
                                  percentChange > 0
                                    ? "text-success"
                                    : "text-danger"
                                }`}
                              >
                                {percentChange.toFixed(2)}%
                              </div>
                            </td>
                            <td className="text-end">
                              <Button
                                variant="outline-primary"
                                onClick={(e) => openModal(stock, e)}
                              >
                                Add to Watchlist
                              </Button>
                            </td>
                          </tr>
                        );
                      } else {
                        return (
                          <tr
                            key={stock.symbol}
                            onClick={() =>
                              navigate(`/dashboard?stock=${stock.symbol}`)
                            }
                            className="cursor-pointer"
                          >
                            <td>
                              <div className="d-flex align-items-center justify-content-between">
                                <strong>{stock.symbol}</strong>
                              </div>
                            </td>
                            <td className="text-end">
                              ₹{stock.closePrice?.toFixed(2)}
                            </td>
                            <td className="text-end">
                              ₹{stock.lowPrice?.toFixed(2)}
                            </td>
                            <td className="text-end">
                              ₹{stock.highPrice?.toFixed(2)}
                            </td>
                            <td className="text-end">
                              <div
                                className={`d-inline-block ${
                                  percentChange > 0
                                    ? "text-success"
                                    : "text-danger"
                                }`}
                              >
                                {percentChange.toFixed(2)}%
                              </div>
                            </td>
                            <td className="text-end">
                              <Button
                                variant="outline-primary"
                                onClick={(e) => openModal(stock, e)}
                              >
                                Add to Watchlist
                              </Button>
                            </td>
                          </tr>
                        );
                      }
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        {searchTerm ? (
                          <>
                            <ExclamationCircle size={24} className="me-2" />
                            No stocks found matching "{searchTerm}"
                          </>
                        ) : (
                          "No stocks available."
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {loadingMore && (
                <div className="text-center py-3">
                  <Spinner animation="border" variant="primary" size="sm" />
                  <span className="ms-2">Loading more stocks...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal for Watchlist */}
        <Modal show={modalShow} onHide={() => setModalShow(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add {selectedStock?.symbol} to Watchlist</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3">
              <select
                className="form-select"
                value={selectedWatchlist}
                onChange={(e) => setSelectedWatchlist(e.target.value)}
              >
                <option value="">Select Watchlist</option>
                {watchlists.map((watchlist) => (
                  <option key={watchlist.id} value={watchlist.id}>
                    {watchlist.name}
                  </option>
                ))}
              </select>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setModalShow(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={addToWatchlist}>
              Add to Watchlist
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default AllStocks;