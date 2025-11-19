import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const MapView = ({ center, onSelectLocation }) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapboxgl.accessToken) return;
    if (mapInstance.current) return;
    if (!mapContainer.current) return;

    mapInstance.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [center.lon, center.lat],
      zoom: 8
    });

    mapInstance.current.addControl(new mapboxgl.NavigationControl());
    mapInstance.current.on('click', (event) => {
      const coords = { lat: event.lngLat.lat, lon: event.lngLat.lng };
      onSelectLocation(coords);
    });

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [center.lat, center.lon, onSelectLocation]);

  useEffect(() => {
    if (!mapInstance.current) return;
    mapInstance.current.flyTo({ center: [center.lon, center.lat], essential: true });
  }, [center.lat, center.lon]);

  if (!mapboxgl.accessToken) {
    return <div className="map-placeholder">Add VITE_MAPBOX_TOKEN to view the map.</div>;
  }

  return <div className="map" ref={mapContainer} />;
};

export default MapView;
