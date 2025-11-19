import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../services/api';

const DEFAULT_COORDINATES = { lat: 40.7128, lon: -74.006 };

export const useWeather = () => {
  const [coords, setCoords] = useState(DEFAULT_COORDINATES);
  const [locationLabel, setLocationLabel] = useState(undefined);
  const [weather, setWeather] = useState({ isLoading: false, error: null, data: null });

  useEffect(() => {
    let cancelled = false;
    const fetchWeather = async () => {
      try {
        setWeather((prev) => ({ ...prev, isLoading: true, error: null }));
        const data = await apiClient.get('/weather', {
          lat: coords.lat,
          lon: coords.lon,
          locationName: locationLabel
        });
        if (!cancelled) {
          setWeather({ isLoading: false, error: null, data });
        }
      } catch (err) {
        if (!cancelled) {
          setWeather({ isLoading: false, data: null, error: err.message || 'Unable to fetch weather' });
        }
      }
    };
    
    fetchWeather();
    return () => {
      cancelled = true;
    };
  }, [coords, locationLabel]);

  const updateCoordinates = useCallback((nextCoords, label) => {
    setCoords(nextCoords);
    setLocationLabel(label);
  }, []);

  return {
    coords,
    weather,
    updateCoordinates
  };
};
