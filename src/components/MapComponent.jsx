// components/MapComponent.jsx
import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const MapComponent = ({ 
  locations = [], 
  center = { lat: 10.3157, lng: 124.6850 }, 
  zoom = 12,
  onLocationSelect, // Callback when user selects a new location
  enableMarking = false // Enable click-to-mark functionality
}) => {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [userMarkedLocation, setUserMarkedLocation] = useState(null);
    const [map, setMap] = useState(null);

    const onLoad = useCallback((map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback((map) => {
        setMap(null);
    }, []);

    // Handle map click to mark a new location
    const handleMapClick = useCallback((event) => {
        if (!enableMarking) return;
        
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        const newLocation = {
            lat: lat,
            lng: lng,
            name: 'New Location',
            address: 'Click to edit details',
            type: 'default',
            status: 'pending',
            isUserMarked: true
        };
        
        setUserMarkedLocation(newLocation);
        setSelectedLocation(newLocation);
        
        // Call parent callback with the new location
        if (onLocationSelect) {
            onLocationSelect(newLocation);
        }
        
        console.log('New location marked:', { lat, lng });
    }, [enableMarking, onLocationSelect]);

    // Internet icons for different location types
    const getIcon = (location) => {
        if (!window.google || !window.google.maps) {
            return undefined;
        }

        let iconUrl;

        switch (location.type) {
            case 'waste_bin':
                iconUrl = 'https://cdn-icons-png.flaticon.com/512/463/463613.png';
                break;
            case 'truck':
                iconUrl = 'https://cdn-icons-png.flaticon.com/512/7137/7137944.png';
                break;
            case 'recycling':
                iconUrl = 'https://cdn-icons-png.flaticon.com/512/1057/1057233.png';
                break;
            case 'disposal':
                iconUrl = 'https://cdn-icons-png.flaticon.com/512/284/284717.png';
                break;
            case 'collection_point':
                iconUrl = 'https://cdn-icons-png.flaticon.com/512/684/684809.png';
                break;
            default:
                iconUrl = location.isUserMarked 
                    ? 'https://cdn-icons-png.flaticon.com/512/684/684910.png' // Blue pin for user marks
                    : 'https://cdn-icons-png.flaticon.com/512/684/684908.png'; // Red pin for existing
        }

        return {
            url: iconUrl,
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 32)
        };
    };

    return (
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
                mapContainerStyle={{
                    width: '100%',
                    height: '400px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                }}
                center={center}
                zoom={zoom}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={handleMapClick} // Add click handler for marking
                options={{
                    cursor: enableMarking ? 'crosshair' : 'default' // Change cursor when marking enabled
                }}
            >
                {/* Existing locations markers */}
                {locations.map((location, index) => (
                    <Marker
                        key={`existing-${index}`}
                        position={{ lat: location.lat, lng: location.lng }}
                        onClick={() => setSelectedLocation(location)}
                        icon={getIcon(location)}
                    />
                ))}

                {/* User-marked location */}
                {userMarkedLocation && (
                    <Marker
                        key="user-marked"
                        position={{ lat: userMarkedLocation.lat, lng: userMarkedLocation.lng }}
                        onClick={() => setSelectedLocation(userMarkedLocation)}
                        icon={getIcon(userMarkedLocation)}
                    />
                )}

                {/* Info Window for selected location */}
                {(selectedLocation) && (
                    <InfoWindow
                        position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                        onCloseClick={() => setSelectedLocation(null)}
                    >
                        <div className="p-2 max-w-xs">
                            <h3 className="font-semibold text-sm mb-1">
                                {selectedLocation.name}
                                {selectedLocation.isUserMarked && (
                                    <span className="ml-1 text-blue-500 text-xs">(New)</span>
                                )}
                            </h3>
                            <p className="text-xs text-gray-600 mb-1">{selectedLocation.address}</p>
                            <p className="text-xs text-gray-500 capitalize">
                                {selectedLocation.type?.replace('_', ' ')}
                            </p>
                            <div className="mt-2 text-xs">
                                <p className="text-gray-500">
                                    <strong>Lat:</strong> {selectedLocation.lat.toFixed(6)}
                                </p>
                                <p className="text-gray-500">
                                    <strong>Lng:</strong> {selectedLocation.lng.toFixed(6)}
                                </p>
                            </div>
                            {selectedLocation.status && (
                                <p className={`text-xs mt-1 ${
                                    selectedLocation.status === 'active' ? 'text-green-600' :
                                    selectedLocation.status === 'full' ? 'text-red-600' :
                                    'text-yellow-600'
                                }`}>
                                    Status: {selectedLocation.status}
                                </p>
                            )}
                            {selectedLocation.isUserMarked && (
                                <button
                                    className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                                    onClick={() => {
                                        // Add functionality to edit this marked location
                                        console.log('Edit location:', selectedLocation);
                                    }}
                                >
                                    Edit Details
                                </button>
                            )}
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
            
            {/* Marking instructions */}
            {enableMarking && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                    <p>💡 <strong>Click anywhere on the map</strong> to mark a new location</p>
                    <p className="text-xs mt-1">Coordinates will be automatically captured</p>
                </div>
            )}
        </LoadScript>
    );
};

export default MapComponent;