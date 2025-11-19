const WeatherCard = ({ weather }) => {
  if (weather.isLoading) {
    return <div className="panel">Fetching weather…</div>;
  }

  if (weather.error) {
    return <div className="panel error">{weather.error}</div>;
  }

  if (!weather.data) {
    return <div className="panel">Select a location to view weather.</div>;
  }

  const { temperature, humidity, description, icon, locationName, country } = weather.data;

  return (
    <div className="panel weather-card">
      <div className="weather-card__header">
        <div>
          <p className="eyebrow">Current weather</p>
          <h3>
            {locationName} <span className="country">{country}</span>
          </h3>
        </div>
        {icon && <img src={`https://openweathermap.org/img/wn/${icon}@2x.png`} alt={description} />}
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
    </div>
  );
};

export default WeatherCard;
