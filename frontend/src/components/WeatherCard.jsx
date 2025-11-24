import { useAuth } from '../context/AuthContext';

const WeatherCard = ({ weather }) => {
  const { user, addFavourite, removeFavourite } = useAuth();

  if (weather.isLoading) {
    return <div className="panel">Fetching weather…</div>;
  }

  if (weather.error) {
    return <div className="panel error">{weather.error}</div>;
  }

  if (!weather.data) {
    return <div className="panel">Select a location to view weather.</div>;
  }

  const {
    temperature,
    humidity,
    description,
    icon,
    locationName,
    country,
    lat,
    lon
  } = weather.data;

  // ⭐ Check if this location is already in favourites
  const isFavourite = user?.favourites?.some(
    (f) => f.lat === lat && f.lon === lon
  );

  // ⭐ Add/remove favourite
  const toggleFavourite = () => {
    const fav = {
      lat,
      lon,
      locationName,
      country
    };

    if (isFavourite) removeFavourite(fav);
    else addFavourite(fav);
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
          <p className="value">{Math.round(temperature)}°C</p>
        </div>
        <div>
          <p className="label">Humidity</p>
          <p className="value">{humidity}%</p>
        </div>
      </div>

      <p className="description">{description}</p>

      {/* ⭐ Favourite Button */}
      {user && (
        <button className="fav-btn" onClick={toggleFavourite}>
          {isFavourite ? "★ Remove Favourite" : "☆ Add to Favourites"}
        </button>
      )}
    </div>
  );
};

export default WeatherCard;

