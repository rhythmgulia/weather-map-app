import { useState } from "react";

import MapView from "./MapView";
import WeatherCard from "./WeatherCard";
import ErrorBanner from "./ErrorBanner";
import { useAuth } from "../context/AuthContext";
import { useWeather } from "../hooks/useWeather";

let typingTimer;

const Dashboard = () => {
  const { user, logout, addRecentSearch } = useAuth();
  const { coords, weather, updateCoordinates } = useWeather();

  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showRecents, setShowRecents] = useState(false);

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  // Reverse Geocode (coords → place name)
  const reverseGeocode = async (lat, lon) => {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${mapboxToken}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.features?.length > 0) {
        return data.features[0].place_name;
      }
      return `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
    } catch (_) {
      return `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
    }
  };

  // Autocomplete search suggestions
  const fetchSuggestions = async (query) => {
    if (!query.trim()) return setSuggestions([]);

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?autocomplete=true&limit=5&access_token=${mapboxToken}`;

      const res = await fetch(url);
      const data = await res.json();
      setSuggestions(data.features || []);
    } catch (err) {
      console.error("Autocomplete error:", err);
    }
  };

  // Submit search
  const handleSearch = async (evt) => {
    evt.preventDefault();
    if (!searchTerm.trim()) return;

    setSearching(true);
    setMapError(null);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchTerm
        )}.json?access_token=${mapboxToken}`
      );

      const data = await response.json();
      if (!data.features?.length) throw new Error("No results found");

      const [lon, lat] = data.features[0].center;
      const placeName = data.features[0].place_name;

      updateCoordinates({ lat, lon }, placeName);

      addRecentSearch({
        lat,
        lon,
        locationName: placeName,
      });

      setSuggestions([]);
    } catch (err) {
      setMapError(err.message || "Unable to find that location");
    } finally {
      setSearching(false);
    }
  };

  // Map click handler
  const handleMapClick = async (coords) => {
    const name = await reverseGeocode(coords.lat, coords.lon);
    updateCoordinates(coords, name);

    addRecentSearch({
      lat: coords.lat,
      lon: coords.lon,
      locationName: name,
    });
  };

  return (
    <div className="dashboard-layout">
      {/* ============================
          LEFT SIDEBAR
      ============================ */}
      <aside className="sidebar">

        {/* User Info */}
        <div className="sidebar-user">
          <h3>{user?.name}</h3>
          <p className="sidebar-email">{user?.email}</p>
        </div>

        {/* Favourites */}
        <div className="sidebar-section">
          <h4>Favourites</h4>
          <div className="sidebar-list">
            {user?.favourites?.length ? (
              user.favourites.map((f, i) => (
                <button
                  key={i}
                  className="sidebar-item"
                  onClick={() =>
                    updateCoordinates({ lat: f.lat, lon: f.lon }, f.locationName)
                  }
                >
                  {f.locationName}
                </button>
              ))
            ) : (
              <p className="empty-text">No favourites yet</p>
            )}
          </div>
        </div>

        {/* Recent Searches */}
        <div className="sidebar-section">
          <button
            className="sidebar-toggle"
            onClick={() => setShowRecents(!showRecents)}
          >
            {showRecents ? "Hide Recent Searches" : "Recent Searches"}
          </button>

          {showRecents && (
            <div className="sidebar-list">
              {user?.recentSearches?.length ? (
                user.recentSearches.map((r, i) => (
                  <button
                    key={i}
                    className="sidebar-item"
                    onClick={() =>
                      updateCoordinates({ lat: r.lat, lon: r.lon }, r.locationName)
                    }
                  >
                    {r.locationName}
                  </button>
                ))
              ) : (
                <p className="empty-text">No recent searches</p>
              )}
            </div>
          )}
        </div>

        {/* Logout */}
        <button className="sidebar-logout" onClick={logout}>
          Logout
        </button>
      </aside>

      {/* ============================
          MAP + WEATHER
      ============================ */}
      <div className="map-wrapper">
        <MapView center={coords} onSelectLocation={handleMapClick} />

        {/* Floating Weather Card */}
        <div className="floating-weather">
          <WeatherCard weather={weather} />
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="floating-search">
          <input
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);

              clearTimeout(typingTimer);
              typingTimer = setTimeout(() => fetchSuggestions(value), 250);
            }}
            placeholder="Search for a place..."
          />
          <button type="submit" disabled={searching}>
            {searching ? "..." : "Search"}
          </button>
        </form>

        {/* Autocomplete dropdown */}
        {suggestions.length > 0 && (
          <ul className="autocomplete-list">
            {suggestions.map((item) => (
              <li
                key={item.id}
                className="autocomplete-item"
                onClick={() => {
                  const [lon, lat] = item.center;
                  const placeName = item.place_name;

                  updateCoordinates({ lat, lon }, placeName);
                  addRecentSearch({ lat, lon, locationName: placeName });

                  setSearchTerm(placeName);
                  setSuggestions([]);
                }}
              >
                {item.place_name}
              </li>
            ))}
          </ul>
        )}

        {(mapError || weather.error) && (
          <ErrorBanner message={mapError || weather.error} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;


