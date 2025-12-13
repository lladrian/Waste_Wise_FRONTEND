import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

const MapLocationPicker = ({ initialLocation, onLocationSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || {
      lat: 11.0062,  // Ormoc City
      lng: 124.6075
    }
  );

  useEffect(() => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  }, [selectedLocation]);

  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  const center = {
    lat: selectedLocation.lat,
    lng: selectedLocation.lng
  };

  const handleMapClick = (event) => {
    const newLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    setSelectedLocation(newLocation);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setSelectedLocation(newLocation);
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 10000,
        }
      );
    }
  };


  return (
    <div className="w-full relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
        onClick={handleMapClick}
      >
        {selectedLocation && <Marker position={selectedLocation} />}
      </GoogleMap>

      {/* Control Buttons - overlay on top of map */}
      <div className="absolute bottom-8 left-5 right-5 flex justify-between z-50">
        <button
          className="bg-blue-500 px-6 py-3 rounded-full text-white font-bold shadow-lg hover:bg-blue-600 transition-colors"
          onClick={getCurrentLocation}
          type="button"  // ← Add this line
        >
          Current Location
        </button>
      </div>
    </div>

  );
};

export default MapLocationPicker;