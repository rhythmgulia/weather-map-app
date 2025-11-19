const express = require('express');
const fetch = require('node-fetch');
const { protect } = require('../middleware/auth');
const { normalizeWeather } = require('../utils/normalizeWeather');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const { lat, lon, city, locationName } = req.query;
  if ((!lat || !lon) && !city) {
    return res.status(400).json({ message: 'Provide lat/lon or city' });
  }

  if (!process.env.WEATHER_API_KEY) {
    return res.status(500).json({ message: 'Missing weather API key' });
  }

  const params = new URLSearchParams({
    appid: process.env.WEATHER_API_KEY,
    units: 'metric'
  });

  if (lat && lon) {
    params.set('lat', lat);
    params.set('lon', lon);
  } else if (city) {
    params.set('q', city);
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (response.status === 404) {
      return res.status(404).json({ message: 'City not found' });
    }
    if (response.status === 429) {
      return res.status(429).json({ message: 'Weather provider rate limit hit' });
    }
    if (!response.ok) {
      return res.status(502).json({ message: 'Weather provider error' });
    }

    const payload = await response.json();
    const normalized = normalizeWeather(payload, locationName);
    res.json(normalized);
  } catch (error) {
    console.error('Weather error', error.message);
    res.status(500).json({ message: 'Unable to fetch weather' });
  }
});

module.exports = router;
