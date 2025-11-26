const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/', protect, (req, res) => {
  res.json({ recent: req.user.recentSearches });
});

router.post('/', protect, async (req, res) => {
  const { lat, lon, locationName, country } = req.body;

  if (!lat || !lon || !locationName) {
    return res.status(400).json({ message: "Missing fields" });
  }
  req.user.recentSearches = req.user.recentSearches.filter(
    (s) => !(s.lat === lat && s.lon === lon)
  );

  req.user.recentSearches.unshift({
    lat,
    lon,
    locationName,
    country,
    searchedAt: new Date()
  });

  req.user.recentSearches = req.user.recentSearches.slice(0, 10);

  await req.user.save();

  res.json({ recent: req.user.recentSearches });
});

module.exports = router;
