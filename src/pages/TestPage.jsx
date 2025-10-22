// React Component (e.g., TestPage.js)
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TestPage = () => {
  const [locationInfo, setLocationInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const res = await axios.post('https://waste-wise-backend-chi.vercel.app/api/location', {
              latitude,
              longitude,
            });
            setLocationInfo(res.data);
          } catch (err) {
            console.error('Error sending location:', err);
            setError('Failed to fetch location info.');
          }
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Permission denied or location unavailable.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Location Info</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!locationInfo && !error && <div>Getting location and sending to server...</div>}
      {locationInfo && (
        <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ccc' }}>
          <p><strong>Latitude:</strong> {locationInfo.latitude}</p>
          <p><strong>Longitude:</strong> {locationInfo.longitude}</p>
          <p><strong>Address:</strong> {locationInfo.address}</p>
        </div>
      )}
    </div>
  );
};

export default TestPage;
