const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    favourites: [
      {
        lat: Number,
        lon: Number,
        locationName: String,
        country: String
      }
    ],  
    recentSearches: [
      {
        locationName: String,
        lat: Number,
        lon: Number,
        country: String,
        searchedAt: { type: Date, default: Date.now }
      }
    ]  
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
