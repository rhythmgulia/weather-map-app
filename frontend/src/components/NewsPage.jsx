import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../services/api';

const NewsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const city = searchParams.get('city') || searchParams.get('locationName') || 'Unknown';
  
  const [news, setNews] = useState({ articles: [], loading: true, error: null });
  const [cityName, setCityName] = useState(city);

  useEffect(() => {
    const fetchNews = async () => {
      setNews(prev => ({ ...prev, loading: true, error: null }));
      try {
        const data = await apiClient.get('/news', { 
          city: cityName,
          locationName: cityName 
        });
        setNews({ 
          articles: data.articles || [], 
          loading: false, 
          error: null,
          totalResults: data.totalResults || 0
        });
      } catch (err) {
        setNews({ 
          articles: [], 
          loading: false, 
          error: err.message || 'Failed to load news' 
        });
      }
    };

    if (cityName) {
      fetchNews();
    }
  }, [cityName]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="news-page">
      <div className="news-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>News for {cityName}</h1>
        <p className="news-subtitle">Latest news and updates</p>
      </div>

      {news.loading && (
        <div className="news-loading">
          <div className="loading-spinner"></div>
          <p>Loading news...</p>
        </div>
      )}

      {news.error && (
        <div className="news-error">
          <p>⚠️ {news.error}</p>
          <p className="error-hint">
            {news.error.includes('API key') 
              ? 'News API key needs to be configured in the backend.'
              : 'Please try again later.'}
          </p>
        </div>
      )}

      {!news.loading && !news.error && news.articles.length === 0 && (
        <div className="news-empty">
          <p>No news articles found for {cityName}</p>
        </div>
      )}

      {!news.loading && !news.error && news.articles.length > 0 && (
        <>
          <div className="news-stats">
            <p>Found {news.articles.length} article{news.articles.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="news-grid">
            {news.articles.map((article, index) => (
              <article key={index} className="news-card">
                {article.urlToImage && (
                  <div className="news-card-image">
                    <img 
                      src={article.urlToImage} 
                      alt={article.title}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="news-card-content">
                  <div className="news-card-header">
                    <span className="news-source">{article.source}</span>
                    <span className="news-date">{formatDate(article.publishedAt)}</span>
                  </div>
                  <h2 className="news-title">{article.title}</h2>
                  {article.description && (
                    <p className="news-description">{article.description}</p>
                  )}
                  {article.author && (
                    <p className="news-author">By {article.author}</p>
                  )}
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="news-link"
                  >
                    Read more →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default NewsPage;

