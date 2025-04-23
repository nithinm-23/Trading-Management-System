import React, { useState, useEffect } from "react";
import axios from "axios";
import { VictoryChart, VictoryCandlestick, VictoryAxis, VictoryTooltip } from "victory";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../components/Navbar";

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
  { symbol: "SBIN.BSE", name: "State Bank of India", change: 0.18 }
];

const TradingDashboard = () => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStock, setSelectedStock] = useState(stocksList[0].symbol);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [currentStock, setCurrentStock] = useState(stocksList[0]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Fetch stock data from API
  const fetchStockData = async (symbol) => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real app, you'd replace this with your API call
      // Using mock data for demonstration
      const mockData = generateMockData(30);
      
      console.log("Formatted Data:", mockData);
      setChartData(mockData);

      const allPrices = mockData.flatMap((d) => [d.open, d.high, d.low, d.close]);
      const minPrice = Math.min(...allPrices);
      const maxPrice = Math.max(...allPrices);

      setPriceRange([
        isNaN(minPrice) ? 900 : minPrice - 25,
        isNaN(maxPrice) ? 1100 : maxPrice + 25,
      ]);
      
      // Find the current stock details
      const stock = stocksList.find(s => s.symbol === symbol) || stocksList[0];
      setCurrentStock(stock);
      
    } catch (err) {
      console.error("Stock API Error:", err);
      setError(err.message || "Could not fetch real-time data.");
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData(selectedStock);
    
    // Auto-refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchStockData(selectedStock);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedStock]);

  // Generate mock data for demonstration
  const generateMockData = (days) => {
    const data = [];
    const today = new Date();
    let price = 950 + Math.random() * 150;

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
        close
      });
      
      price = close;
    }
    
    return data;
  };

  // Filter chartData to include only the most recent 14 days
  const filteredChartData = chartData.slice(-20);
  const tickValues = filteredChartData.map(d => d.x);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Calculate current price and change
  const getCurrentPrice = () => {
    if (chartData.length === 0) return { price: "N/A", change: 0, percentChange: 0 };
    
    const lastDay = chartData[chartData.length - 1];
    const previousDay = chartData[chartData.length - 2] || lastDay;
    
    const price = lastDay.close;
    const change = lastDay.close - previousDay.close;
    const percentChange = (change / previousDay.close) * 100;
    
    return {
      price: price.toFixed(2),
      change: change.toFixed(2),
      percentChange: percentChange.toFixed(2)
    };
  };

  const currentPrice = getCurrentPrice();

  // Navbar component (using the one you provided)
 

  return (
    <div className="d-flex flex-column vh-100">
      <Navbar />
      
      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Sidebar for stocks */}
        <div className={bg-light border-end ${sidebarCollapsed ? 'collapsed' : ''}} style={{ 
          width: sidebarCollapsed ? '60px' : '280px',
          transition: 'width 0.3s ease'
        }}>
          <div className="d-flex justify-content-between align-items-center p-3 bg-primary text-white">
            {!sidebarCollapsed && <h5 className="mb-0">Stocks</h5>}
            <button className="btn btn-sm btn-primary" onClick={toggleSidebar}>
              {sidebarCollapsed ? '>>' : '<<'}
            </button>
          </div>
          
          <div className="overflow-auto" style={{ height: 'calc(100vh - 115px)' }}>
            {stocksList.map((stock) => (
              <div 
                key={stock.symbol} 
                onClick={() => setSelectedStock(stock.symbol)}
                className={p-3 border-bottom ${selectedStock === stock.symbol ? 'bg-primary text-white' : 'hover-bg-light'}}
                style={{ cursor: 'pointer' }}
              >
                {!sidebarCollapsed ? (
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold">{stock.symbol}</div>
                      <div className="small">{stock.name}</div>
                    </div>
                    <div className={stock.change >= 0 ? 'text-success' : 'text-danger'}>
                      {stock.change >= 0 ? '▲' : '▼'}
                      {' '}{Math.abs(stock.change)}%
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className={${selectedStock === stock.symbol ? 'text-white' : stock.change >= 0 ? 'text-success' : 'text-danger'}}>
                      {stock.symbol.split('.')[0].substring(0, 3)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-grow-1 p-3 overflow-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4>{currentStock.name} ({currentStock.symbol})</h4>
              <div className={fs-5 ${parseFloat(currentPrice.change) >= 0 ? 'text-success' : 'text-danger'}}>
                ₹{currentPrice.price} 
                <span className="ms-2">
                  {parseFloat(currentPrice.change) >= 0 ? '▲' : '▼'}
                  {' '}{Math.abs(currentPrice.change)} ({Math.abs(currentPrice.percentChange)}%)
                </span>
              </div>
            </div>
            <button 
              className="btn btn-outline-primary" 
              onClick={() => fetchStockData(selectedStock)}
              disabled={isLoading}
            >
              {isLoading ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
          </div>
          
          {/* Chart Controls */}
          <div className="card mb-3">
            <div className="card-body p-2">
              <div className="d-flex flex-wrap">
                <div className="btn-group me-3">
                  <button className="btn btn-sm btn-primary active">1D</button>
                  <button className="btn btn-sm btn-outline-primary">1W</button>
                  <button className="btn btn-sm btn-outline-primary">1M</button>
                  <button className="btn btn-sm btn-outline-primary">3M</button>
                  <button className="btn btn-sm btn-outline-primary">1Y</button>
                  <button className="btn btn-sm btn-outline-primary">YTD</button>
                </div>
                
                <div className="btn-group me-3">
                  <button className="btn btn-sm btn-primary active">
                    📊 Candlestick
                  </button>
                  <button className="btn btn-sm btn-outline-primary">📈 Line</button>
                </div>
                
                <div className="btn-group">
                  <button className="btn btn-sm btn-outline-primary">Indicators</button>
                  <button className="btn btn-sm btn-outline-primary">Compare</button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="alert alert-warning">
              {error}
            </div>
          )}
          
          {/* Chart Card */}
          <div className="card">
            <div className="card-body">
              {isLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span className="ms-2">Loading {selectedStock} chart...</span>
                </div>
              ) : (
                <div style={{ height: '400px' }}>
                  <VictoryChart 
                    scale={{ x: "time" }} 
                    domainPadding={{ x: 20 }} 
                    height={400}
                    width={900}
                  >
                    {/* X-Axis (Time) */}
                    <VictoryAxis
                      tickValues={tickValues}
                      tickFormat={(t) => new Date(t).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      style={{ 
                        tickLabels: { fontSize: 10, padding: 5 },
                        grid: { stroke: "#ECEFF1", strokeWidth: 1 }
                      }}
                    />
                    
                    {/* Y-Axis (Price) */}
                    <VictoryAxis
                      dependentAxis
                      domain={priceRange}
                      tickFormat={(t) => ₹${t.toFixed(0)}}
                      style={{ 
                        tickLabels: { fontSize: 10, padding: 5 },
                        grid: { stroke: "#ECEFF1", strokeWidth: 1 }
                      }}
                    />
                    
                    {/* Candlestick Chart */}
                    <VictoryCandlestick
                      data={filteredChartData}
                      candleColors={{ positive: "#26a69a", negative: "#ef5350" }}
                      candleWidth={15}
                      labels={({ datum }) =>
                        Date: ${datum.x.toLocaleDateString()}\nOpen: ₹${datum.open.toFixed(2)}\nHigh: ₹${datum.high.toFixed(2)}\nLow: ₹${datum.low.toFixed(2)}\nClose: ₹${datum.close.toFixed(2)}
                      }
                      labelComponent={<VictoryTooltip cornerRadius={0} flyoutStyle={{ fill: "white", stroke: "#ccc" }} />}
                    />
                  </VictoryChart>
                </div>
              )}
            </div>
          </div>
          
          {/* Order Form */}
          <div className="card mt-3">
            <div className="card-body">
              <h5 className="card-title">Place Order</h5>
              <div className="row">
                <div className="col-md-8">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <select className="form-select">
                        <option>CNC</option>
                        <option>MIS</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <input type="number" className="form-control" placeholder="Qty" defaultValue="1" />
                    </div>
                    <div className="col-md-4">
                      <input type="number" className="form-control" placeholder="Price" defaultValue={currentPrice.price} />
                    </div>
                    <div className="col-md-2">
                      <div className="form-check form-switch mt-2">
                        <input className="form-check-input" type="checkbox" id="buySwitch" defaultChecked />
                        <label className="form-check-label" htmlFor="buySwitch">Buy</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <button className="btn btn-success w-100">Place Order</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;