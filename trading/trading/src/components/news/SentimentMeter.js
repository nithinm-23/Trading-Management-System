import React from "react";
import PropTypes from "prop-types";

const SentimentMeter = ({ articles }) => {
  const calculateSentiment = () => {
    if (!articles.length) return 0;

    const positiveWords = ["bullish", "gain", "rise", "profit", "growth"];
    const negativeWords = ["bearish", "drop", "fall", "loss", "decline"];

    let score = 0;

    articles.forEach((article) => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      positiveWords.forEach((word) => {
        if (text.includes(word)) score++;
      });
      negativeWords.forEach((word) => {
        if (text.includes(word)) score--;
      });
    });

    return (score / articles.length) * 10; // Normalize to -10 to +10 scale
  };

  const sentiment = calculateSentiment();
  const percentage = Math.min(Math.max(sentiment + 50, 0), 100); // Convert to 0-100 scale

  return (
    <div className="sentiment-meter">
      <div className="meter-labels">
        <span>Bearish</span>
        <span>Neutral</span>
        <span>Bullish</span>
      </div>
      <div className="meter-track">
        <div
          className="meter-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor:
              sentiment > 5
                ? "#4CAF50"
                : sentiment < -5
                ? "#F44336"
                : "#FFC107",
          }}
        />
      </div>
    </div>
  );
};

SentimentMeter.propTypes = {
  articles: PropTypes.array.isRequired,
};

export default SentimentMeter;
