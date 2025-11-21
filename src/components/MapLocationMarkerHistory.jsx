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

        // Convert to simple {lat, lng}
        const formatted = raw.map((item) => ({
          lat: item.position.lat,
          lng: item.position.lng,
        }));

        setRouteHistory(formatted);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  // Default fallback location
  const selectedLocation = initialLocation || {
    lat: 11.0062,
    lng: 124.6075,
  };

  const center = routeHistory.length > 0 ? routeHistory[0] : selectedLocation;

  const mapContainerStyle = {
    width: "100%",
    height: "400px",
  };

  return (
    <div className="w-full relative space-y-4">
      <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={16}>
        
        {/* Draw Polyline */}
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

        {/* Moving Marker */}
        {routeHistory.length > 0 && (
          <Marker
            position={routeHistory[currentIndex]}
            label="●"
          />
        )}

        {/* START Marker (Green) */}
        {routeHistory.length > 0 && (
          <Marker
            position={routeHistory[0]}
            label="S"
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
            }}
          />
        )}

        {/* END Marker (Red) */}
        {routeHistory.length > 1 && (
          <Marker
            position={routeHistory[routeHistory.length - 1]}
            label="E"
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            }}
          />
        )}
      </GoogleMap>

      {/* Slider */}
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
