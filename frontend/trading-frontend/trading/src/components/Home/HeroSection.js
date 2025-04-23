import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/trading-chart");
  };

  return (
    <section
      style={{ backgroundColor: "#001f3f", color: "white" }}
      className="py-5"
    >
      <div className="container">
        <div className="row align-items-center">
          {/* Left Text Section */}
          <div className="col-lg-6">
            <h1 className="display-4 fw-bold mb-4">
              Trade Smarter, Not Harder
            </h1>
            <p className="lead mb-4">
              At our core, we're revolutionizing trading management through
              cutting-edge technology and intuitive platforms. Our system
              empowers traders with:
            </p>

            <ul className="about-features mb-4">
              <li>
                <strong>Real-time Analytics:</strong> Instant market insights
                with millisecond latency
              </li>
              <li>
                <strong>AI-Powered Tools:</strong> Smart algorithms for
                technical analysis and pattern recognition
              </li>
              <li>
                <strong>Portfolio Guardianship:</strong> Automated risk
                management and stop-loss protection
              </li>
              <li>
                <strong>Multi-Exchange Integration:</strong> Unified access to
                global markets
              </li>
              <li>
                <strong>Institutional-Grade Security:</strong> Bank-level
                encryption and fraud prevention
              </li>
            </ul>
            <div className="d-flex gap-3">
              {/* <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
                Get Started
              </button>
              <button className="btn btn-outline-light btn-lg">Learn More</button> */}
            </div>
          </div>

          {/* Right Image Section */}
          <div className="col-lg-6 p-0">
            <div className="w-100 h-100">
              <img
                src="https://www.samco.in/knowledge-center/wp-content/uploads/cache/2024/11/Best-Stocks-for-Intraday-Trading-in-India-2025/516317644.jpg"
                alt="Trading platform visualization"
                className="img-fluid w-100 h-100 object-fit-cover rounded-3 shadow-lg"
                style={{
                  minHeight: "400px",
                  objectFit: "cover",
                  minWidth: "750px",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
