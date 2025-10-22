import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LocationTracker = () => {
  const [locationInfo, setLocationInfo] = useState(null);
  const [error, setError] = useState('');
  const [data, setData] = useState('');


  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setData({ latitude, longitude })
        try {
          const response = await axios.get(
            'https://waste-wise-backend-chi.vercel.app/api/location',
            {
              params: {
                lat: latitude,
                lon: longitude,
              },
            }
          );

          setLocationInfo(response.data);
        } catch (err) {
          console.error('Failed to fetch location data:', err);
          setError('Failed to get location data from server.');
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Location access denied or not available.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div>
      <h2>Real-Time Location</h2>
      <p><strong>Latitude:</strong> {data.latitude}</p>
      <p><strong>Longitude:</strong> {data.longitude}</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {locationInfo ? (
        <div>
          <p><strong>Latitude:</strong> {locationInfo.latitude}</p>
          <p><strong>Longitude:</strong> {locationInfo.longitude}</p>
          <p><strong>Address:</strong> {locationInfo.address}</p>
        </div>
      ) : (
        !error && <p>Fetching location...</p>
      )}
    </div>
  );
};

export default LocationTracker;
