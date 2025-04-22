import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Footer = () => {
  return (
    <footer
      className="bg-light text-dark py-4 mt-5"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div className="container-fluid">
        <div className="text-center text-md-start" style={{ display: "flex" }}>
          {/* Logo & Address */}
          <div className="col-md-4">
            <h4 className="fw-bold">Stock Trading</h4>
            <p>
              Vaishnavi Tech Park, South Tower, 3rd Floor <br />
              Sarjapur Main Road, Bellandur <br />
              Bengaluru - 560103, Karnataka <br />
              <a href="#" className="text-primary">
                Contact Us
              </a>
            </p>
            {/* Social Icons */}
            <div className="d-flex justify-content-center justify-content-md-start gap-3">
              <i className="fab fa-facebook"></i>
              <i className="fab fa-x-twitter"></i>
              <i className="fab fa-youtube"></i>
              <i className="fab fa-instagram"></i>
              <i className="fab fa-linkedin"></i>
              <i className="fab fa-telegram"></i>
            </div>
          </div>

          {/* Products Section */}
          {/* <div className="col-md-2">
            <h5 className="fw-bold">PRODUCTS</h5>
            <ul className="list-unstyled">
              <li>Stocks</li>
              <li>Futures & Options</li>
              <li>IPO</li>
              <li>Mutual Funds</li>
              <li>NFO</li>
              <li>ETF</li>
              <li>Algo Trading</li>
            </ul>
          </div> */}

          {/* Groww Section */}
          <div className="col-md-2">
            {/* <h5 className="fw-bold">GROWW</h5> */}
            <ul className="list-unstyled">
              <li>About Us</li>
              <li>Pricing</li>
              <li>Blog</li>
              <li>Media & Press</li>
              <li>Careers</li>
              <li>Help & Support</li>
            </ul>
          </div>

          {/* Quick Links Section */}
          <div className="col-md-2">
            <h5 className="fw-bold">QUICK LINKS</h5>
            <ul className="list-unstyled">
              <li>AMC Mutual Funds</li>
              <li>Calculators</li>
              <li>Glossary</li>
              <li>Open Demat Account</li>
              <li>Groww Digest</li>
              <li>Sitemap</li>
              <li>Income Tax Calculator</li>
            </ul>
          </div>

          {/* App Store & Play Store */}
          <div className="col-md-2 text-center">
            <h5 className="fw-bold">Download</h5>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Download_on_the_App_Store_Badge.svg/192px-Download_on_the_App_Store_Badge.svg.png"
              alt="App Store"
              width="140"
              className="mb-2"
            />
            <br />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/192px-Google_Play_Store_badge_EN.svg.png"
              alt="Google Play"
              width="140"
            />
          </div>
        </div>

        {/* Copyright Footer */}
        <div className="text-center mt-4">
          <p className="mb-0">
            &copy; 2025-Forever StockPro. All rights reserved. Built with ❤ in
            India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
