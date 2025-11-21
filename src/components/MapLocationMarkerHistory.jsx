import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { getSpecificCollectorAttendance } from "./../hooks/collector_attendance_management_hook";

const MapLocationMarkerHistory = ({ initialLocation, attendance_id }) => {
  const [routeHistory, setRouteHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchAttendance(attendance_id);
  }, [attendance_id]);

  const fetchAttendance = async (attendance_id) => {
    try {
      const { data, success } = await getSpecificCollectorAttendance(attendance_id);

      if (success) {
        const raw = data.data.route_history || [];

        // Extract positions only → [{lat,lng}, ...]
        const formatted = raw.map((item) => ({
          lat: item.position.lat,
          lng: item.position.lng,
        }));

        setRouteHistory(formatted);

        // Start from first position
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  // Default center if no initial
  const selectedLocation = initialLocation || {
    lat: 11.0062,
    lng: 124.6075,
  };

  // If route exists, map centers on first point
  const center = routeHistory.length > 0 ? routeHistory[0] : selectedLocation;

  const mapContainerStyle = {
    width: "100%",
    height: "400px",
  };

  return (
    <div className="w-full relative space-y-4">
      <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={16}>
        {/* Route Polyline */}
        {routeHistory.length > 0 && (
          <Polyline
            path={routeHistory}
            options={{
              strokeColor: "#1e90ff",
              strokeOpacity: 0.9,
              strokeWeight: 4,
            }}
          />
        )}

        {/* Moving Marker based on slider index */}
        {routeHistory.length > 0 && (
          <Marker position={routeHistory[currentIndex]} />
        )}
      </GoogleMap>

      {/* Slider Control */}
      {routeHistory.length > 1 && (
        <div className="w-full p-2">
          <input
            type="range"
            min={0}
            max={routeHistory.length - 1}
            value={currentIndex}
            onChange={(e) => setCurrentIndex(Number(e.target.value))}
            className="w-full"
          />

          <div className="text-center mt-1 text-sm text-gray-700">
            Step {currentIndex + 1} / {routeHistory.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapLocationMarkerHistory;
