import React, { useState, useEffect, useRef, useCallback } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const MapLocationMarkerDraw = ({ 
  initialLocation, 
  routeData = [], 
  onRouteChange, 
  onColorChange, 
  initialPolylineColor 
}) => {
  const [routePoints, setRoutePoints] = useState([]);
  const [map, setMap] = useState(null);
  const [polylineColor, setPolylineColor] = useState("#009900");
  const isInitialMount = useRef(true);
  const polylineRef = useRef(null);

  // Initialize from dynamic routeData - ONLY ON INITIAL MOUNT
  useEffect(() => {
    if (Array.isArray(routeData) && routeData.length > 0 && isInitialMount.current) {
      const converted = routeData.map((item) => ({
        lat: item.lat,
        lng: item.lng,
      }));
      setRoutePoints(converted);
      isInitialMount.current = false;
    }

    // ✅ SET COLOR FROM BACKEND
    if (initialPolylineColor) {
      setPolylineColor(initialPolylineColor);
    }
  }, [routeData, initialPolylineColor]);

  // Update polyline when routePoints OR color changes
  useEffect(() => {
    if (!map || !window.google) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    if (routePoints.length > 1) {
      const newPolyline = new window.google.maps.Polyline({
        path: routePoints,
        strokeColor: polylineColor,
        strokeOpacity: 0.9,
        strokeWeight: 5,
        map: map
      });
      polylineRef.current = newPolyline;
    } else {
      polylineRef.current = null;
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [routePoints, map, polylineColor]);

  const selectedLocation = initialLocation || { lat: 11.0062, lng: 124.6075 };
  const center = routePoints.length > 0 ? routePoints[0] : selectedLocation;

  const handleMapClick = useCallback((e) => {
    const newPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setRoutePoints((prev) => {
      const updated = [...prev, newPoint];
      // Use setTimeout to defer the callback to avoid render phase updates
      setTimeout(() => {
        if (onRouteChange) onRouteChange(updated);
      }, 0);
      return updated;
    });
  }, [onRouteChange]);

  const removeLastPoint = useCallback(() => {
    setRoutePoints((prev) => {
      if (prev.length === 0) return prev;
      const updated = prev.slice(0, -1);
      // Use setTimeout to defer the callback to avoid render phase updates
      setTimeout(() => {
        if (onRouteChange) onRouteChange(updated);
      }, 0);
      return updated;
    });
  }, [onRouteChange]);

  const clearRoute = useCallback(() => {
    setRoutePoints([]);
    // Use setTimeout to defer the callback to avoid render phase updates
    setTimeout(() => {
      if (onRouteChange) onRouteChange([]);
    }, 0);
  }, [onRouteChange]);

  const handleColorChange = useCallback((color) => {
    setPolylineColor(color);
    // Use setTimeout to defer the callback to avoid render phase updates
    setTimeout(() => {
      if (onColorChange) onColorChange(color);
    }, 0);
  }, [onColorChange]);

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }
    setMap(null);
  }, []);

  // START/END markers only
  const getStartAndEndMarkers = useCallback(() => {
    const markers = [];

    if (routePoints.length > 0) {
      markers.push({
        position: routePoints[0],
        label: "START",
        icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
        key: "start-marker"
      });
    }

    if (routePoints.length > 1) {
      markers.push({
        position: routePoints[routePoints.length - 1],
        label: "END",
        icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        key: "end-marker"
      });
    }

    return markers;
  }, [routePoints]);

  const startEndMarkers = getStartAndEndMarkers();

  return (
    <div className="w-full space-y-4">
      {/* COLOR SELECTOR */}
      <div className="flex flex-col space-y-2">
        <label className="font-semibold text-sm">Polyline Color:</label>

        <div className="flex flex-wrap gap-2">
          {[
            "#8B0000", // Dark Red
            "#00008B", // Dark Blue
            "#006400", // Dark Green
            "#FF8C00", // Dark Orange
            "#4B0082", // Indigo / Dark Purple
            "#000000", // Black
            "#8B004F", // Dark Pink / Wine
            "#B8860B", // Dark Goldenrod
            "#008B8B", // Dark Cyan
            "#4A2C2A", // Dark Brown
          ].map((color) => (
            <div
              key={color}
              onClick={() => handleColorChange(color)}
              style={{ backgroundColor: color }}
              className={`
                w-7 h-7 rounded-full cursor-pointer border-2 
                transition-all duration-200 shadow
                ${polylineColor === color ? "scale-110 border-white" : "border-gray-600"}
              `}
            />
          ))}
        </div>
      </div>

      <div className="flex space-x-2 items-center">
        <button
          type="button"
          onClick={clearRoute}
          disabled={routePoints.length === 0}
          className={`px-3 py-1 rounded ${routePoints.length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"}`}
        >
          Clear Route
        </button>

        <button
          type="button"
          onClick={removeLastPoint}
          disabled={routePoints.length === 0}
          className={`px-3 py-1 rounded ${routePoints.length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600 text-white"}`}
        >
          Remove Last Point
        </button>

        <span className="text-sm text-gray-600">
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
        {startEndMarkers.map((marker) => (
          <Marker
            key={marker.key}
            position={marker.position}
            label={{
              text: marker.label,
              color: "black",
              fontSize: "18px",
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