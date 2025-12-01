const express = require('express');
const fetch = require('node-fetch');
const { protect } = require('../middleware/auth');
const { normalizeWeather } = require('../utils/normalizeWeather');

const router = express.Router();

// Test if One Call API is available
const testOneCallAPI = async (apiKey, lat, lon) => {
  try {
    const testUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    console.log('Testing One Call API access with URL:', testUrl);
    const response = await fetch(testUrl);
    const data = await response.json();
    console.log('One Call API test result:', response.status, data);
    
    // Check if we got a valid response
    if (response.ok && data) {
      return { available: true, data };
    } else {
      console.log('One Call API not available or returned error:', response.status, data);
      return { available: false, error: data, status: response.status };
    }
  } catch (error) {
    console.error('One Call API test failed:', error.message);
    return { available: false, error: error.message };
  }
};

// Alternative: Test if forecast API is available
const testForecastAPI = async (apiKey, lat, lon) => {
  try {
    const testUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    console.log('Testing Forecast API access with URL:', testUrl);
    const response = await fetch(testUrl);
    const data = await response.json();
    console.log('Forecast API test result:', response.status, data);
    
    // Check if we got a valid response
    if (response.ok && data) {
      return { available: true, data };
    } else {
      console.log('Forecast API not available or returned error:', response.status, data);
      return { available: false, error: data, status: response.status };
    }
  } catch (error) {
    console.error('Forecast API test failed:', error.message);
    return { available: false, error: error.message };
  }
};

// Convert forecast API data to match One Call format
const convertForecastToOnecallFormat = (forecastData) => {
  if (!forecastData || !forecastData.list) {
    return null;
  }
  
  // Group forecast by day for daily forecast
  const daily = [];
  const hourly = [];
  
  // Process the forecast data
  forecastData.list.forEach(item => {
    // Add to hourly forecast
    hourly.push({
      dt: item.dt,
      temp: item.main.temp,
      feels_like: item.main.feels_like,
      humidity: item.main.humidity,
      wind_speed: item.wind?.speed || null,
      weather: item.weather
    });
    
    // For daily, we'll take one item per day (at noon)
    const date = new Date(item.dt * 1000);
    const hours = date.getHours();
    
    // If it's around noon (11-13), add to daily
    if (hours >= 11 && hours <= 13) {
      daily.push({
        dt: item.dt,
        temp: {
          max: item.main.temp_max || item.main.temp,
          min: item.main.temp_min || item.main.temp
        },
        humidity: item.main.humidity,
        wind_speed: item.wind?.speed || null,
        weather: item.weather,
        pressure: item.main.pressure
      });
    }
  });
  
  return { hourly, daily };
};

router.get('/', protect, async (req, res) => {
  const { lat, lon, city, locationName } = req.query;
  if ((!lat || !lon) && !city) {
    return res.status(400).json({ message: 'Provide lat/lon or city' });
  }

  if (!process.env.WEATHER_API_KEY) {
    return res.status(500).json({ message: 'Missing weather API key' });
  }

  try {
    // Fetch current weather data
    const currentWeatherParams = new URLSearchParams({
      appid: process.env.WEATHER_API_KEY,
      units: 'metric'
    });

    if (lat && lon) {
      currentWeatherParams.set('lat', lat);
      currentWeatherParams.set('lon', lon);
    } else if (city) {
      currentWeatherParams.set('q', city);
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?${currentWeatherParams.toString()}`;
    console.log('Fetching current weather from:', currentWeatherUrl);
    const currentResponse = await fetch(currentWeatherUrl);
    
    if (currentResponse.status === 404) {
      return res.status(404).json({ message: 'City not found' });
    }
    if (currentResponse.status === 429) {
      return res.status(429).json({ message: 'Weather provider rate limit hit' });
    }
    if (!currentResponse.ok) {
      const errorText = await currentResponse.text().catch(() => 'Unable to read response');
      console.error('Current weather API error:', currentResponse.status, errorText);
      return res.status(502).json({ message: 'Weather provider error' });
    }

    const currentPayload = await currentResponse.json();
    console.log('Current weather received:', JSON.stringify(currentPayload, null, 2));
    
    // Test if One Call API is available
    const forecastLat = lat || currentPayload.coord.lat;
    const forecastLon = lon || currentPayload.coord.lon;
    const oneCallTest = await testOneCallAPI(process.env.WEATHER_API_KEY, forecastLat, forecastLon);
    
    let forecastData = null;
    if (oneCallTest.available) {
      console.log('One Call API is available, using forecast data');
      forecastData = oneCallTest.data;
    } else {
      // Try alternative forecast API
      console.log('One Call API not available, trying Forecast API...');
      const forecastTest = await testForecastAPI(process.env.WEATHER_API_KEY, forecastLat, forecastLon);
      
      if (forecastTest.available) {
        console.log('Forecast API is available, converting data');
        // Convert forecast API data to match One Call format
        forecastData = convertForecastToOnecallFormat(forecastTest.data);
        console.log('Converted forecast data:', forecastData);
      } else {
        console.log('Forecast API not available either:', forecastTest);
        // Even if forecast fails, we can still return current weather data
        console.log('Forecast data not available, returning current weather only');
      }
    }
    
    // Additional debugging
    if (forecastData) {
      console.log('Forecast data structure:');
      console.log('- hourly:', forecastData.hourly ? `Array with ${forecastData.hourly.length} items` : 'undefined/null');
      console.log('- daily:', forecastData.daily ? `Array with ${forecastData.daily.length} items` : 'undefined/null');
    }

    const normalized = normalizeWeather(currentPayload, locationName, forecastData);
    console.log('Normalized data:', JSON.stringify(normalized, null, 2));
    
    // Additional debugging for normalized data
    console.log('Normalized forecast data:');
    console.log('- hourlyForecast:', normalized.hourlyForecast ? `Array with ${normalized.hourlyForecast.length} items` : 'undefined/null');
    console.log('- dailyForecast:', normalized.dailyForecast ? `Array with ${normalized.dailyForecast.length} items` : 'undefined/null');
    
    res.json(normalized);
  } catch (error) {
    console.error('Weather error', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ message: 'Unable to fetch weather' });
  }
});

module.exports = router;