import React, { useState, useEffect, useRef, useCallback } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const MapLocationMarkerDraw = ({ initialLocation, routeData = [], onRouteChange }) => {
  const [routePoints, setRoutePoints] = useState([]);
  const [map, setMap] = useState(null);
  const polylineRef = useRef(null);

  // Initialize from dynamic routeData
  useEffect(() => {
    if (Array.isArray(routeData) && routeData.length > 0) {
      const converted = routeData.map((item) => ({
        lat: item.position.lat,
        lng: item.position.lng,
      }));
      setRoutePoints(converted);
    }
  }, [routeData]);

  // Update polyline when routePoints change
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // Create new polyline if we have at least 2 points
    if (routePoints.length > 1) {
      const newPolyline = new window.google.maps.Polyline({
        path: routePoints,
        strokeColor: "#009900",
        strokeOpacity: 0.9,
        strokeWeight: 5,
        map: map
      });
      polylineRef.current = newPolyline;
    } else {
      polylineRef.current = null;
    }

    // Cleanup on unmount
    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [routePoints, map]);

  const selectedLocation = initialLocation || { lat: 11.0062, lng: 124.6075 };
  const center = routePoints.length > 0 ? routePoints[0] : selectedLocation;

  const handleMapClick = (e) => {
    const newPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setRoutePoints((prev) => {
      const updated = [...prev, newPoint];
      if (onRouteChange) onRouteChange(updated);
      return updated;
    });
  };

  const removeLastPoint = () => {
    setRoutePoints((prev) => {
      if (prev.length === 0) return prev;
      const updated = prev.slice(0, -1);
      if (onRouteChange) onRouteChange(updated);
      return updated;
    });
  };

  const clearRoute = () => {
    setRoutePoints([]);
    if (onRouteChange) onRouteChange([]);
  };

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }
    setMap(null);
  }, []);

  // Get only START and END points for markers
  const getStartAndEndMarkers = () => {
    const markers = [];
    
    if (routePoints.length > 0) {
      // START marker (first point)
      markers.push({
        position: routePoints[0],
        label: "START",
        icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
        key: "start-marker"
      });
    }
    
    if (routePoints.length > 1) {
      // END marker (last point)
      markers.push({
        position: routePoints[routePoints.length - 1],
        label: "END", 
        icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        key: "end-marker"
      });
    }
    
    return markers;
  };

  const startEndMarkers = getStartAndEndMarkers();

  return (
    <div className="w-full space-y-4">
      <div className="flex space-x-2 items-center">
        <button 
          type="button" 
          onClick={clearRoute} 
          disabled={routePoints.length === 0} 
          className={`px-3 py-1 rounded ${routePoints.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white'}`}
        >
          Clear Route
        </button>
        <button 
          type="button" 
          onClick={removeLastPoint} 
          disabled={routePoints.length === 0} 
          className={`px-3 py-1 rounded ${routePoints.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}
        >
          Remove Last Point
        </button>
        <span className="text-sm text-gray-600">
          {/* Points: {routePoints.length} {routePoints.length > 0 && `(Showing ${startEndMarkers.length} markers)`} */}
          Points: {routePoints.length}
        </span>
      </div>

      <GoogleMap 
        mapContainerStyle={containerStyle} 
        center={center} 
        zoom={15} 
        onClick={handleMapClick}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* Render only START and END markers */}
        {startEndMarkers.map((marker) => (
          <Marker
            key={marker.key}
            position={marker.position}
            label={{
              text: marker.label,
              color: "white",
              fontSize: "12px",
              fontWeight: "bold"
            }}
            icon={{
              url: marker.icon,
              scaledSize: new window.google.maps.Size(40, 40)
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
};

export default MapLocationMarkerDraw;