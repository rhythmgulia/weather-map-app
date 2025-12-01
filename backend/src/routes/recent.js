const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/', protect, (req, res) => {
  res.json({ recent: req.user.recentSearches || [] });
});

router.post('/', protect, async (req, res) => {
  const { lat, lon, locationName, country } = req.body;

  if (!lat || !lon || !locationName) {
    return res.status(400).json({ message: "Missing fields" });
  }

  // Ensure recentSearches exists
  if (!req.user.recentSearches) {
    req.user.recentSearches = [];
  }

  // Remove duplicate if exists
  req.user.recentSearches = req.user.recentSearches.filter(
    (s) => !(s.lat === lat && s.lon === lon)
  );

  // Add new search at the beginning
  req.user.recentSearches.unshift({
    lat,
    lon,
    locationName,
    country,
    searchedAt: new Date()
  });

  // Keep only the last 3 searches
  req.user.recentSearches = req.user.recentSearches.slice(0, 3);

  // Mark the field as modified to ensure Mongoose saves it
  req.user.markModified('recentSearches');
  
  await req.user.save();

  res.json({ recent: req.user.recentSearches });
});

module.exports = router;
