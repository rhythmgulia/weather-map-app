const express = require('express');
const fetch = require('node-fetch');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const { city, locationName } = req.query;
  
  if (!city && !locationName) {
    return res.status(400).json({ message: 'Provide city or locationName' });
  }

  // Use NewsAPI.org - free tier allows 100 requests/day
  // Extract city name from locationName if provided (e.g., "New York, NY, USA" -> "New York")
  const searchQuery = city || locationName?.split(',')[0] || locationName;
  
  if (!process.env.NEWS_API_KEY) {
    // Fallback: Use a free alternative or return mock data
    return res.status(500).json({ message: 'News API key not configured' });
  }

  try {
    // NewsAPI.org endpoint
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&sortBy=publishedAt&pageSize=20&language=en&apiKey=${process.env.NEWS_API_KEY}`;
    
    const response = await fetch(url);
    
    if (response.status === 429) {
      return res.status(429).json({ message: 'News API rate limit exceeded' });
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ 
        message: errorData.message || 'Failed to fetch news' 
      });
    }

    const data = await response.json();
    
    // Format the response
    const articles = (data.articles || []).map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source?.name || 'Unknown',
      author: article.author
    }));

    res.json({ 
      articles,
      totalResults: data.totalResults || articles.length,
      city: searchQuery
    });
  } catch (error) {
    console.error('News API error:', error.message);
    res.status(500).json({ message: 'Unable to fetch news' });
  }
});

module.exports = router;

