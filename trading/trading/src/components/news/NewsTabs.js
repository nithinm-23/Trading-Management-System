import React, { useState } from "react";

const NewsTabs = ({ initialArticles, onTabChange }) => {
  const [activeTab, setActiveTab] = useState("headlines");
  const [localArticles, setLocalArticles] = useState(initialArticles);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    } else {
      // Fallback local filtering
      setLocalArticles(
        tab === "headlines"
          ? initialArticles
          : initialArticles.filter(
              (article) =>
                article.title.toLowerCase().includes("stock") ||
                article.title.toLowerCase().includes("market")
            )
      );
    }
  };

  const articlesToShow = onTabChange ? initialArticles : localArticles;

  return (
    <div className="news-tabs-container">
      <div className="news-tabs-header">
        <button
          className={`tab-btn ${activeTab === "headlines" ? "active" : ""}`}
          onClick={() => handleTabChange("headlines")}
        >
          Market Headlines
        </button>
        <button
          className={`tab-btn ${activeTab === "analysis" ? "active" : ""}`}
          onClick={() => handleTabChange("analysis")}
        >
          Investing Analysis
        </button>
      </div>

      <div className="news-grid">
        {articlesToShow?.length > 0 ? (
          articlesToShow.map((article, index) => (
            <div key={index} className="news-card">
              {/* Your existing news card JSX */}
            </div>
          ))
        ) : (
          <div className="no-articles">
            No articles found. Try refreshing or check back later.
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsTabs;
