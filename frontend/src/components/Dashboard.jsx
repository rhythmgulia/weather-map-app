import { useState, useEffect } from 'react';
import MapView from './MapView';
import WeatherCard from './WeatherCard';
import ErrorBanner from './ErrorBanner';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../hooks/useWeather';

const Dashboard = () => {
  const { user, logout, addRecentSearch } = useAuth();
  const { coords, weather, updateCoordinates } = useWeather();
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);


  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  // const handleSearch = async (evt) => {
  //   evt.preventDefault();
  //   if (!searchTerm.trim()) return;
  //   if (!mapboxToken) {
  //     setMapError('Mapbox token missing');
  //     return;
  //   }
  //   setSearching(true);
  //   setMapError(null);
  //   try {
  //     const response = await fetch(
  //       `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchTerm)}.json?access_token=${mapboxToken}`
  //     );
  //     const payload = await response.json();
  //     if (!payload.features?.length) {
  //       throw new Error('No results found');
  //     }
  //     const [lon, lat] = payload.features[0].center;
  //     updateCoordinates({ lat, lon }, payload.features[0].place_name);

  //     addRecentSearch({
  //       lat,
  //       lon,
  //       locationName: payload.features[0].place_name,
  //       country: payload.features[0].context?.find(c => c.id.startsWith("country"))?.text || ""
  //     });
  //   } catch (err) {
  //     setMapError(err.message || 'Unable to find that location');
  //   } finally {
  //     setSearching(false);
  //   }
  // };

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
      const placeName = payload.features[0].place_name;
      const country =
        payload.features[0].context?.find((c) => c.id?.startsWith('country'))?.text || '';
  
      // update map + weather
      updateCoordinates({ lat, lon }, placeName);
  
      // save recent search (safe call, won't block UI)
      try {
        await addRecentSearch({ lat, lon, locationName: placeName, country });
      } catch (err) {
        // keep UX smooth; optionally setMapError(err.message)
        console.error('Failed to save recent search', err);
      }
    } catch (err) {
      setMapError(err.message || 'Unable to find that location');
    } finally {
      setSearching(false);
    }
  };
  
  
  const isFav = user?.favourites?.some(
    (f) => f?.lat === coords.lat && f?.lon === coords.lon
  );
  
  
  const toggleFavourite = (fav) => {
    if (isFavourite) removeFavourite(fav);
    else addFavourite(fav);
  };

  let typingTimer;
  const fetchSuggestions = async (text) => {
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?autocomplete=true&limit=5&access_token=${mapboxToken}`;

      const res = await fetch(url);
      const data = await res.json();

      setSuggestions(data.features || []);
    } catch (err) {
      console.error("Autocomplete error:", err);
    }
  };

  useEffect(() => {
    const close = () => setIsTyping(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);
  

  

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
        onChange={(e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setIsTyping(true);

        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => fetchSuggestions(value), 300); // 300ms debounce
        }}
        placeholder="Search by city or place"
        />
        <button type="submit" disabled={searching}>
          {searching ? 'Searching…' : 'Go'}
        </button>
        </form>
        {isTyping && suggestions.length > 0 && (
          <ul className="autocomplete-list">
            {suggestions.map((item) => (
            <li
            key={item.id}
            onClick={() => {
              const [lon, lat] = item.center;

              updateCoordinates({ lat, lon }, item.place_name);

              // add to recent searches
              addRecentSearch({
                lat,
                lon,
                locationName: item.place_name,
                country:
                  item.context?.find((c) => c.id.startsWith('country'))?.text || ''
              });

              setSearchTerm(item.place_name);
              setSuggestions([]);
              setIsTyping(false);
            }}
            className="autocomplete-item"
          >
          {item.place_name}
          </li>
        ))}
        </ul>
)}


        {(mapError || weather.error) && <ErrorBanner message={mapError || weather.error} />}

      </section>

      <section className="recent-searches">
        <h3>Recent Searches</h3>
        {user?.recentSearches?.length === 0 && <p>No recent searches.</p>}
        <ul>
          {user?.recentSearches?.map((s, idx) => (
            <li key={idx}>
            <button
              className="recent-btn"
              onClick={() => updateCoordinates({ lat: s.lat, lon: s.lon }, s.locationName)}
            >
            {s.locationName}
            </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="dashboard__content">
        <div className="map-panel">
          <MapView center={coords} onSelectLocation={updateCoordinates} />
        </div>
        <div className="info-panel">
          <WeatherCard weather={weather} />
        </div>
      </section>

      <section className="favourites">
        <h3>Favourites</h3>
        {user?.favourites?.map(f => (
        <button
          key={`${f.lat}-${f.lon}`}
          onClick={() => updateCoordinates({ lat: f.lat, lon: f.lon }, f.locationName)}
          className="fav-location"
        >
        {f.locationName}
        </button>
      ))}
      </section>

    </div>
  );
};

export default Dashboard;
