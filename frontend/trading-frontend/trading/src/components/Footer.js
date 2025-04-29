import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Footer.css"; // Linked to custom styles

const Footer = () => {
  return (
    <footer className="footer-container py-5 mt-5">
      <div className="container">
        <div className="row gy-5">
          {/* Logo & Address */}
          <div className="col-12 col-md-4">
            <h4 className="fw-bold text-white">Stock Trading</h4>
            <p className="text-light">
              Vaishnavi Tech Park, South Tower, 3rd Floor <br />
              Sarjapur Main Road, Bellandur <br />
              Bengaluru - 560103, Karnataka
            </p>
            <div className="d-flex flex-wrap gap-3">
              <i className="fab fa-facebook social-icon"></i>
              <i className="fab fa-twitter social-icon"></i>
              <i className="fab fa-youtube social-icon"></i>
              <i className="fab fa-instagram social-icon"></i>
              <i className="fab fa-linkedin social-icon"></i>
              <i className="fab fa-telegram social-icon"></i>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-2">
            <h5 className="fw-bold text-white">Quick Links</h5>
            <ul className="list-unstyled text-light">
              <li>
                <a href="#">AMC Mutual Funds</a>
              </li>
              <li>
                <a href="#">Calculators</a>
              </li>
              <li>
                <a href="#">Glossary</a>
              </li>
              <li>
                <a href="#">Open Demat Account</a>
              </li>
              <li>
                <a href="#">Groww Digest</a>
              </li>
              <li>
                <a href="#">Sitemap</a>
              </li>
              <li>
                <a href="#">Income Tax Calculator</a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-6 col-md-2">
            <h5 className="fw-bold text-white">Company</h5>
            <ul className="list-unstyled text-light">
              <li>
                <a href="#">About Us</a>
              </li>
              <li>
                <a href="#">Pricing</a>
              </li>
              <li>
                <a href="#">Blog</a>
              </li>
              <li>
                <a href="#">Media & Press</a>
              </li>
              <li>
                <a href="#">Careers</a>
              </li>
              <li>
                <a href="#">Help & Support</a>
              </li>
            </ul>
          </div>

          {/* Download Links */}
          <div className="col-12 col-md-3 text-md-end text-center">
            <h5 className="fw-bold text-white mb-3">Download</h5>
            <div className="d-flex flex-column align-items-center align-items-md-end">
              <img
                src="https://blog.fluidmeet.com/wp-content/uploads/2022/11/available-app-store-icon-app-store-and-google-play-icons-text-number-symbol-alphabet-transparent-png-1516662-02-1.png"
                alt="App Store"
                width="140"
                className="mb-2"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/192px-Google_Play_Store_badge_EN.svg.png"
                alt="Google Play"
                width="140"
              />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-5">
          <p className="mb-0">
            &copy; 2025–Forever <strong>StockPro</strong>. All rights reserved.
            Built with ❤ in India.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
