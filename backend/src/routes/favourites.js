const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get all favourites
router.get('/', protect, async (req, res) => {
  res.json({ favourites: req.user.favourites });
});

// Add favourite
router.post('/', protect, async (req, res) => {
  const { lat, lon, locationName, country } = req.body;

  if (!lat || !lon || !locationName) {
    return res.status(400).json({ message: "Missing fields" });
  }

  // Prevent duplicates
  const exists = req.user.favourites.some(f => f.lat === lat && f.lon === lon);

  if (exists) {
    return res.status(409).json({ message: "Already favourited" });
  }

  req.user.favourites.push({ lat, lon, locationName, country });
  await req.user.save();

  res.json({ favourites: req.user.favourites });
});

// Remove favourite
router.delete('/', protect, async (req, res) => {
  const { lat, lon } = req.body;

  req.user.favourites = req.user.favourites.filter(
    f => f.lat !== lat || f.lon !== lon
  );

  await req.user.save();

  res.json({ favourites: req.user.favourites });
});

module.exports = router;
