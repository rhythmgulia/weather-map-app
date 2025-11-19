import { useState } from 'react';
import MapView from './MapView';
import WeatherCard from './WeatherCard';
import ErrorBanner from './ErrorBanner';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../hooks/useWeather';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { coords, weather, updateCoordinates } = useWeather();
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [mapError, setMapError] = useState(null);

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  const handleSearch = async (evt) => {
    evt.preventDefault();
    if (!searchTerm.trim()) return;
    if (!mapboxToken) {
      setMapError('Mapbox token missing');
      return;
    }
    setSearching(true);
    setMapError(null);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchTerm)}.json?access_token=${mapboxToken}`
      );
      const payload = await response.json();
      if (!payload.features?.length) {
        throw new Error('No results found');
      }
      const [lon, lat] = payload.features[0].center;
      updateCoordinates({ lat, lon }, payload.features[0].place_name);
    } catch (err) {
      setMapError(err.message || 'Unable to find that location');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <p className="eyebrow">Logged in as</p>
          <h2>{user?.name ?? user?.email}</h2>
        </div>
        <button onClick={logout} className="ghost">
          Logout
        </button>
      </header>

      <section className="dashboard__controls">
        <form onSubmit={handleSearch} className="search-form">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by city or place"
          />
          <button type="submit" disabled={searching}>
            {searching ? 'Searching…' : 'Go'}
          </button>
        </form>
        {(mapError || weather.error) && <ErrorBanner message={mapError || weather.error} />}
      </section>

      <section className="dashboard__content">
        <div className="map-panel">
          <MapView center={coords} onSelectLocation={updateCoordinates} />
        </div>
        <div className="info-panel">
          <WeatherCard weather={weather} />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
