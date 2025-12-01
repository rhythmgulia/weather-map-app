import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import LineChart from "./LineChart";

// Utility function to format time
const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Utility function to format date
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp * 1000).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

// Utility function to format sunrise/sunset time
const formatSunTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const WeatherCard = ({ weather }) => {
  const navigate = useNavigate();
  const { user, addFavourite, removeFavourite } = useAuth();
  const [expanded, setExpanded] = useState(false);

  if (weather.isLoading) {
    return <div className="panel">Fetching weather…</div>;
  }

  if (weather.error) {
    return <div className="panel error">{weather.error}</div>;
  }

  if (!weather.data) {
    return <div className="panel">Select a location to view weather.</div>;
  }

  // Safely extract values
  const {
    temperature,
    humidity,
    description,
    icon,
    locationName,
    country,
    lat,
    lon,
    feels_like,
    wind_speed,
    visibility,
    pressure,
    sunrise,
    sunset,
    hourlyForecast,
    dailyForecast
  } = weather.data;

  // ⭐ Check if favourite exists
  const isFavourite = user?.favourites?.some(
    (f) => Number(f.lat) === Number(lat) && Number(f.lon) === Number(lon)
  );

  // ⭐ Toggle favourite
  const toggleFavourite = () => {
    const fav = {
      lat,
      lon,
      locationName,
      country,
    };

    if (isFavourite) {
      removeFavourite(fav);
    } else {
      addFavourite(fav);
    }
  };

  // Toggle forecast accordion
  const toggleAccordion = () => {
    console.log('Toggling accordion. Current state:', expanded);
    console.log('Hourly forecast:', hourlyForecast);
    console.log('Daily forecast:', dailyForecast);
    setExpanded(!expanded);
  };

  return (
    <div className="panel weather-card">
      <div className="weather-card__header">
        <div>
          <p className="eyebrow">Current weather</p>
          <h3>
            {locationName} <span className="country">{country}</span>
          </h3>
        </div>
        {icon && (
          <img
            src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
            alt={description}
          />
        )}
      </div>

      <div className="weather-card__metrics">
        <div>
          <p className="label">Temperature</p>
          <p className="value">{temperature !== null ? `${Math.round(temperature)}°C` : 'N/A'}</p>
        </div>
        <div>
          <p className="label">Humidity</p>
          <p className="value">{humidity !== null ? `${humidity}%` : 'N/A'}</p>
        </div>
        <div>
          <p className="label">Feels Like</p>
          <p className="value">{feels_like !== null ? `${Math.round(feels_like)}°C` : 'N/A'}</p>
        </div>
      </div>

      <p className="description">{description}</p>

      {/* Additional metrics row */}
      <div className="weather-card__metrics">
        <div>
          <p className="label">Wind Speed</p>
          <p className="value">{wind_speed !== null ? `${wind_speed} m/s` : 'N/A'}</p>
        </div>
        <div>
          <p className="label">Visibility</p>
          <p className="value">{visibility !== null ? `${visibility} km` : 'N/A'}</p>
        </div>
        <div>
          <p className="label">Pressure</p>
          <p className="value">{pressure !== null ? `${pressure} hPa` : 'N/A'}</p>
        </div>
      </div>

      {/* Sunrise/Sunset */}
      {(sunrise || sunset) && (
        <div className="weather-card__metrics">
          <div>
            <p className="label">Sunrise</p>
            <p className="value">{sunrise ? formatSunTime(sunrise) : 'N/A'}</p>
          </div>
          <div>
            <p className="label">Sunset</p>
            <p className="value">{sunset ? formatSunTime(sunset) : 'N/A'}</p>
          </div>
        </div>
      )}

      {/* ⭐ Favourite Button */}
      {user && (
        <button className="fav-btn" onClick={toggleFavourite}>
          {isFavourite ? "★ Remove Favourite" : "☆ Add to Favourites"}
        </button>
      )}

      {/* ⭐ News Button */}
      {weather.data && (
        <button 
          className="news-btn" 
          onClick={() => navigate(`/news?city=${encodeURIComponent(locationName)}&locationName=${encodeURIComponent(locationName)}`)}
        >
          📰 View News for {locationName.split(',')[0]}
        </button>
      )}

      {/* Forecast Accordion */}
      <div className="forecast-section">
        <button 
          className={`accordion ${expanded ? 'active' : ''}`} 
          onClick={toggleAccordion}
        >
          <span>Forecast Details</span>
          <span className="accordion-arrow">{expanded ? '▲' : '▼'}</span>
        </button>
        
        {expanded && (
          <div className="accordion-content">
            {/* Debug information */}
            <div style={{ padding: '10px', fontSize: '12px', color: '#666' }}>
              Hourly forecast length: {hourlyForecast ? hourlyForecast.length : 'undefined'}
              <br />
              Daily forecast length: {dailyForecast ? dailyForecast.length : 'undefined'}
            </div>
            
            {/* Temperature Graph */}
            {(hourlyForecast && hourlyForecast.length > 0) ? (
              <div className="forecast-group">
                <h4>Temperature Trend (Next 24 hours)</h4>
                <LineChart data={hourlyForecast} width={350} height={120} />
              </div>
            ) : (
              <div className="forecast-group">
                <h4>Temperature Trend</h4>
                <p>No hourly forecast data available</p>
              </div>
            )}

            {/* Hourly Forecast */}
            {(hourlyForecast && hourlyForecast.length > 0) ? (
              <div className="forecast-group">
                <h4>Hourly Forecast (Next 24 hours)</h4>
                <div className="hourly-forecast">
                  {hourlyForecast.map((hour, index) => (
                    <div key={index} className="forecast-item">
                      <p className="time">{formatTime(hour.dt)}</p>
                      {hour.icon && (
                        <img
                          src={`https://openweathermap.org/img/wn/${hour.icon}.png`}
                          alt={hour.description}
                          className="forecast-icon"
                        />
                      )}
                      <p className="temp">{hour.temp !== null ? `${Math.round(hour.temp)}°` : 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="forecast-group">
                <h4>Hourly Forecast</h4>
                <p>No hourly forecast data available</p>
              </div>
            )}

            {/* Daily Forecast */}
            {(dailyForecast && dailyForecast.length > 0) ? (
              <div className="forecast-group">
                <h4>7-Day Forecast</h4>
                <div className="daily-forecast">
                  {dailyForecast.map((day, index) => (
                    <div key={index} className="forecast-item">
                      <p className="day">{formatDate(day.dt)}</p>
                      {day.icon && (
                        <img
                          src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                          alt={day.description}
                          className="forecast-icon"
                        />
                      )}
                      <div className="temp-range">
                        {day.temp_max !== null && day.temp_min !== null ? (
                          <>
                            <span className="temp-max">{Math.round(day.temp_max)}°</span>
                            <span className="temp-min">{Math.round(day.temp_min)}°</span>
                          </>
                        ) : (
                          <span>N/A</span>
                        )}
                      </div>
                      <div className="forecast-details">
                        <p>Wind: {day.wind_speed !== null ? `${day.wind_speed} m/s` : 'N/A'}</p>
                        <p>Humidity: {day.humidity !== null ? `${day.humidity}%` : 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="forecast-group">
                <h4>7-Day Forecast</h4>
                <p>No daily forecast data available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherCard;