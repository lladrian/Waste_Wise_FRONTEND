import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

const MapLocationMarker = ({ initialLocation }) => {
  const selectedLocation = initialLocation || {
    lat: 11.0062,  // Ormoc City
    lng: 124.6075
  };

  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  const center = {
    lat: selectedLocation.lat,
    lng: selectedLocation.lng
  };


  return (
    <div className="w-full relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
      >
        {selectedLocation && <Marker position={selectedLocation}  />}
      </GoogleMap>
    </div>
  );
};

export default MapLocationMarker;