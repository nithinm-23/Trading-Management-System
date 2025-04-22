import React from "react";
// import TradingChart from "./TradingChart";
// import Navbar from "../components/Navbar";
import HeroSection from "../components/Home/HeroSection";
import FeaturesSection from "../components/Home/FeatureSection";
import FeedbackForm from "../components/Home/FeedbackForm";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div>
      {/* <Navbar /> */}
      {/* <h2 className="text-center">Welcome</h2> */}
      {/* <TradingChart /> */}
      <HeroSection />
      <FeaturesSection />
      <FeedbackForm />
      <Footer />
    </div>
  );
};

export default Home;
