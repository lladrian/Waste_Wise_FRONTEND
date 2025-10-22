// components/TestMap.jsx
import React from 'react';
import { LoadScript, GoogleMap } from '@react-google-maps/api';

const TestMap = () => {
  return (
    <LoadScript 
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      onError={(error) => console.error('Google Maps loading error:', error)}
      onLoad={() => console.log('Google Maps loaded successfully')}
    >
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '400px' }}
        center={{ lat: 10.3157, lng: 124.6850 }}
        zoom={12}
      >
        {/* Simple map without markers first */}
      </GoogleMap>
    </LoadScript>
  );
};

export default TestMap;