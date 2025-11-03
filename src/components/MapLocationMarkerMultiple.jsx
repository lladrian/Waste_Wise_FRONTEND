import React from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

const MapLocationMarkerMultiple = ({ locations = [], height = '400px' }) => {
  // Default center (Ormoc City) if no locations are passed
  const defaultCenter = {
    lat: 11.0062,
    lng: 124.6075,
  };

  const mapContainerStyle = {
    width: '100%',
    height: height,
  };

  // If at least one location exists, center the map on the first one
  const center = locations.length > 0 ? locations[0] : defaultCenter;

  return (
    <div className="w-full relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
      >
        {/* Render multiple markers */}
        {locations.map((loc, index) => (
          <Marker
            key={index}
            position={{ lat: loc.lat, lng: loc.lng }}
          />
        ))}
      </GoogleMap>
    </div>
  );
};

export default MapLocationMarkerMultiple;
