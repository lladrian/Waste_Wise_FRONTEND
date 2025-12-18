// components/SimpleMap.jsx
import React from 'react';
import GoogleMapReact from 'google-map-react';

const LocationMarker = ({ text }) => (
  <div style={{ color: 'red', fontWeight: 'bold' }}>
    📍 {text}
  </div>
);

const SimpleMap = ({ center = { lat: 10.3157, lng: 124.6850 }, zoom = 12 }) => {
  return (
    <div style={{ height: '400px', width: '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY }}
        defaultCenter={center}
        defaultZoom={zoom}
      >
        <LocationMarker
          lat={center.lat}
          lng={center.lng}
          text="Waste Collection Point"
        />
      </GoogleMapReact>
    </div>
  );
};

export default SimpleMap;