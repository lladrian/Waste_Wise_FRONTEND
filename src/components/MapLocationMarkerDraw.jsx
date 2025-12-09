import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const MapLocationMarkerDraw = ({ initialLocation, routeData = [], onRouteChange }) => {
  const [routePoints, setRoutePoints] = useState([]);

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
      const updated = prev.slice(0, -1);
      if (onRouteChange) onRouteChange(updated);
      return updated;
    });
  };

  const clearRoute = () => {
    setRoutePoints([]);
    if (onRouteChange) onRouteChange([]);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex space-x-2">
        <button type="button" onClick={clearRoute} disabled={routePoints.length === 0} className="px-3 py-1 bg-red-500 text-white rounded">
          Clear Route
        </button>
        <button type="button" onClick={removeLastPoint} disabled={routePoints.length === 0} className="px-3 py-1 bg-yellow-500 text-white rounded">
          Remove Last Point
        </button>
      </div>

      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15} onClick={handleMapClick}>
        {routePoints.length > 0 && (
          <Marker position={routePoints[0]} label="START" icon={{ url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" }} />
        )}
        {routePoints.length > 1 && (
          <Marker position={routePoints[routePoints.length - 1]} label="END" icon={{ url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" }} />
        )}
        {routePoints.length > 0 && (
          <Polyline path={routePoints} options={{ strokeColor: "#009900", strokeOpacity: 0.9, strokeWeight: 5 }} />
        )}
        {routePoints.map((point, index) => <Marker key={index} position={point} />)}
      </GoogleMap>

      {/* <pre className="mt-2">{JSON.stringify(routePoints, null, 2)}</pre> */}
    </div>
  );
};

export default MapLocationMarkerDraw;
