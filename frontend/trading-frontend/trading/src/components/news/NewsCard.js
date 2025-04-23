import React from "react";
import PropTypes from "prop-types";

const NewsCard = ({ article, compact }) => {
  const publishedDate = new Date(article.publishedAt).toLocaleDateString();

  return (
    <div className={`news-card ${compact ? "compact" : ""}`}>
      {article.urlToImage && (
        <div className="news-image-container">
          <img
            src={article.urlToImage}
            alt={article.title}
            onError={(e) => (e.target.src = "/placeholder-news.png")}
          />
        </div>
      )}
      <div className="news-content">
        <h3>{article.title}</h3>
        {!compact && <p className="description">{article.description}</p>}
        <div className="news-footer">
          <span className="source">{article.source?.name || "Unknown"}</span>
          <span className="date">{publishedDate}</span>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="read-more"
          >
            Read →
          </a>
        </div>
      </div>
    </div>
  );
};

NewsCard.propTypes = {
  article: PropTypes.object.isRequired,
  compact: PropTypes.bool,
};

export default NewsCard;
