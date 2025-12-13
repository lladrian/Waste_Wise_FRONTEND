// React Component (e.g., LocationSender.js)
import React, { useEffect } from 'react';
import axios from 'axios';

const LocationSender = () => {
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await axios.post('http://localhost:5000/api/location', {
            latitude,
            longitude,
          });
          console.log('Location info from backend:', res.data);
        } catch (err) {
          console.error('Error sending location:', err);
        }
      });
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }, []);

  return <div>Getting location and sending to server...</div>;
};

export default LocationSender;
