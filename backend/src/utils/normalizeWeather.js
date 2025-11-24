const normalizeWeather = (payload, fallbackName) => {
  if (!payload || !payload.main) {
    throw new Error('Invalid weather payload');
  }

  return {
    temperature: payload.main.temp,
    humidity: payload.main.humidity,
    description: payload.weather?.[0]?.description ?? 'Unknown',
    icon: payload.weather?.[0]?.icon ?? '',
    locationName: fallbackName || payload.name,
    country: payload.sys?.country ?? '',
    lat: payload.coord.lat,
    lon: payload.coord.lon
  };
  
};

module.exports = { normalizeWeather };
