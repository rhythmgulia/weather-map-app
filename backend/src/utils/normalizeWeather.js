const normalizeWeather = (payload, fallbackName, forecastData) => {
  if (!payload || !payload.main) {
    throw new Error('Invalid weather payload');
  }

  console.log('Normalizing weather data. Forecast data available:', !!forecastData);
  
  // Process hourly forecast (next 24 hours)
  const hourlyForecast = [];
  if (forecastData && forecastData.hourly) {
    console.log(`Processing hourly forecast. Found ${forecastData.hourly.length} items.`);
    // Get next 24 hours (24 items)
    for (let i = 0; i < Math.min(24, forecastData.hourly.length); i++) {
      const hour = forecastData.hourly[i];
      if (hour) {
        hourlyForecast.push({
          dt: hour.dt || 0,
          temp: hour.temp !== undefined ? hour.temp : null,
          feels_like: hour.feels_like !== undefined ? hour.feels_like : null,
          humidity: hour.humidity !== undefined ? hour.humidity : null,
          wind_speed: hour.wind_speed !== undefined ? hour.wind_speed : null,
          description: hour.weather?.[0]?.description ?? 'Unknown',
          icon: hour.weather?.[0]?.icon ?? ''
        });
      }
    }
    console.log(`Processed ${hourlyForecast.length} hourly forecast items.`);
  } else {
    console.log('No hourly forecast data available.');
  }

  // Process 7-day forecast
  const dailyForecast = [];
  if (forecastData && forecastData.daily) {
    console.log(`Processing daily forecast. Found ${forecastData.daily.length} items.`);
    // Skip first day (today) and get next 7 days
    for (let i = 1; i <= Math.min(7, forecastData.daily.length - 1); i++) {
      const day = forecastData.daily[i];
      if (day) {
        dailyForecast.push({
          dt: day.dt || 0,
          temp_max: day.temp?.max !== undefined ? day.temp.max : null,
          temp_min: day.temp?.min !== undefined ? day.temp.min : null,
          humidity: day.humidity !== undefined ? day.humidity : null,
          wind_speed: day.wind_speed !== undefined ? day.wind_speed : null,
          description: day.weather?.[0]?.description ?? 'Unknown',
          icon: day.weather?.[0]?.icon ?? '',
          sunrise: day.sunrise || null,
          sunset: day.sunset || null,
          pressure: day.pressure !== undefined ? day.pressure : null
        });
      }
    }
    console.log(`Processed ${dailyForecast.length} daily forecast items.`);
  } else {
    console.log('No daily forecast data available.');
  }

  // Extract sunrise/sunset from current weather or first day of forecast
  const sunrise = payload.sys?.sunrise || (forecastData?.daily?.[0]?.sunrise ?? null);
  const sunset = payload.sys?.sunset || (forecastData?.daily?.[0]?.sunset ?? null);

  const result = {
    temperature: payload.main.temp !== undefined ? payload.main.temp : null,
    humidity: payload.main.humidity !== undefined ? payload.main.humidity : null,
    description: payload.weather?.[0]?.description ?? 'Unknown',
    icon: payload.weather?.[0]?.icon ?? '',
    locationName: fallbackName || payload.name,
    country: payload.sys?.country ?? '',
    lat: payload.coord.lat,
    lon: payload.coord.lon,
    // Additional data with null checks
    feels_like: payload.main.feels_like !== undefined ? payload.main.feels_like : null,
    wind_speed: payload.wind?.speed ?? null,
    visibility: payload.visibility ? payload.visibility / 1000 : null, // Convert to km
    pressure: payload.main.pressure !== undefined ? payload.main.pressure : null,
    sunrise: sunrise,
    sunset: sunset,
    // Forecast data
    hourlyForecast: hourlyForecast,
    dailyForecast: dailyForecast
  };
  
  console.log('Normalized weather data result:', result);
  return result;
};

module.exports = { normalizeWeather };