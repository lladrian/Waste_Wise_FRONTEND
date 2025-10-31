import React, { useEffect, useState, useContext, useRef } from "react";
import { toast } from "react-toastify";
import { getAllTruck } from "../../hooks/truck_map_hook";
import { AuthContext } from "../../context/AuthContext";

const TruckMap = () => {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const ws = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  // WebSocket connection
  useEffect(() => {
   // ws.current = new WebSocket("ws://localhost:5000");
    ws.current = new WebSocket("wss://waste-wise-backend-uzub.onrender.com");

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.name) {
        case "trucks":
          const filteredSchedules = message.data.filter(schedule => {
            // Check if route exists and has merge_barangay array
            if (!schedule.route || !schedule.route.merge_barangay) {
              return false;
            }

            // Check if any barangay in merge_barangay matches the requested barangay_id
            return schedule.route.merge_barangay.some(barangay =>
              barangay.barangay_id.toString() === user?.barangay
            );
          });

          const list = user.role !== "barangay_official" ? message.data : filteredSchedules;
          setRecords(list);
          setFilteredRecords(list);
          break;
        default:
          console.warn("Unknown data list:", message.name);
      }
    };

    ws.current.onopen = () => {
      // console.log("WebSocket connected");
    };

    ws.current.onclose = () => {
      // console.log("WebSocket disconnected");
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Helper: get today in Philippine timezone (YYYY-MM-DD)
  function getTodayFormatted() {
    const now = new Date();

    // Convert to Philippine timezone offset (UTC+8)
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const philippinesTime = new Date(utc + 8 * 3600000);

    // Format as YYYY-MM-DD
    const year = philippinesTime.getFullYear();
    const month = String(philippinesTime.getMonth() + 1).padStart(2, "0");
    const day = String(philippinesTime.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const fetchData = async () => {
    try {
      const { data, success } = await getAllTruck(user?.barangay, getTodayFormatted());

      if (success) {
        const list = user.role !== "barangay_official" ? data.trucks : data.trucks2 || [];
        setRecords(list);
        setFilteredRecords(list);

        const uniqueStatuses = [
          ...new Set(list.map((item) => (item.truck?.status || "").toLowerCase())),
        ];
        setStatusOptions(uniqueStatuses);
      }
    } catch (err) {
      console.error("Error fetching truck data:", err);
      toast.error("Failed to load truck data");
    }
  };

  // Filter records by selected status
  useEffect(() => {
    if (selectedStatus === "all") {
      setFilteredRecords(records);
    } else {
      setFilteredRecords(
        records.filter(
          (r) => (r.truck?.status || "").toLowerCase() === selectedStatus.toLowerCase()
        )
      );
    }
  }, [selectedStatus, records]);

  // Initialize map only once
  useEffect(() => {
    const initMap = async () => {
      if (!window.google) return;
      const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");

      // Default center Ormoc City
      const center = { lat: 11.0064, lng: 124.6075 };
      const map = new window.google.maps.Map(document.getElementById("map"), {
        center,
        zoom: 12,
        mapId: "DEMO_MAP_ID",
      });

      mapRef.current = { map, AdvancedMarkerElement };
    };

    initMap();
  }, []);

  // Update markers when filteredRecords change
  useEffect(() => {
    if (!mapRef.current) return;
    const { map, AdvancedMarkerElement } = mapRef.current;

    // Helper to create marker content
    const createMarkerContent = (truck) => {
      const iconImg = createStatusIcon(truck.status);

      const markerDiv = document.createElement("div");
      markerDiv.style.display = "flex";
      markerDiv.style.flexDirection = "column";
      markerDiv.style.alignItems = "center";
      markerDiv.style.textAlign = "center";

      const label = document.createElement("div");
      label.innerText = truck.truck_id || "N/A";
      label.style.backgroundColor = "rgba(0,0,0,0.7)";
      label.style.color = "white";
      label.style.padding = "2px 6px";
      label.style.borderRadius = "4px";
      label.style.fontSize = "11px";
      label.style.fontWeight = "600";
      label.style.marginBottom = "3px";
      label.style.whiteSpace = "nowrap";

      markerDiv.appendChild(label);
      markerDiv.appendChild(iconImg);

      return markerDiv;
    };

    // Update existing markers or add new markers
    filteredRecords.forEach((record) => {
      const truck = record.truck;
      const lat = truck?.position?.lat;
      const lng = truck?.position?.lng;
      if (!lat || !lng) return;

      const existingMarker = markersRef.current[truck.truck_id];

      if (existingMarker) {
        // Update position if changed
        existingMarker.position = { lat, lng };
        // Optionally update icon/status here if needed
      } else {
        // Create new marker
        const content = createMarkerContent(truck);

        const marker = new AdvancedMarkerElement({
          map,
          position: { lat, lng },
          title: `Truck ID: ${truck.truck_id}`,
          content,
        });

        marker.addListener("click", () => {
          setSelectedTruck({
            truck_id: truck.truck_id,
            status: truck.status || "N/A",
            route_name: record.route?.route_name || "No route assigned",
            garbage_type: record.garbage_type || "N/A",
            scheduled_collection: record.scheduled_collection || "N/A",
            driver: truck.user || {},
            remark: record.remark || "None",
          });
        });

        markersRef.current[truck.truck_id] = marker;
      }
    });

    // Remove markers that no longer exist
    const currentTruckIds = filteredRecords.map((r) => r.truck?.truck_id);
    Object.keys(markersRef.current).forEach((truckId) => {
      if (!currentTruckIds.includes(truckId)) {
        markersRef.current[truckId].setMap(null);
        delete markersRef.current[truckId];
      }
    });
  }, [filteredRecords]);

  // Truck status icons helper
  const createStatusIcon = (status) => {
    const s = (status || "").toLowerCase();
    let iconUrl;
    if (s === "active" || s === "on route")
      iconUrl = "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
    else if (s === "inactive" || s === "under maintenance" || s === "unavailable")
      iconUrl = "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";
    else
      iconUrl = "https://maps.google.com/mapfiles/ms/icons/green-dot.png";

    const img = document.createElement("img");
    img.src = iconUrl;
    img.style.width = "45px";
    img.style.height = "45px";
    return img;
  };

  // Close modal
  const closeModal = () => setSelectedTruck(null);

  return (
    <div className="relative">
      {/* Status filter dropdown (optional, add UI if needed) */}

      {/* Map container */}
      <div id="map" className="w-full h-[500px] rounded shadow" />

      {/* Modal for selected truck */}
      {selectedTruck && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded-md shadow-lg w-96 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-2">
              Truck ID: {selectedTruck.truck_id}
            </h2>

            <div className="space-y-1 text-sm text-gray-700">
              <p>
                <strong>Status:</strong> {selectedTruck.status}
              </p>
              <p>
                <strong>Route:</strong> {selectedTruck.route_name}
              </p>
              <p>
                <strong>Garbage Type:</strong> {selectedTruck.garbage_type}
              </p>
              <p>
                <strong>Scheduled:</strong> {selectedTruck.scheduled_collection}
              </p>
              <hr className="my-2" />
              <p>
                <strong>Driver:</strong>{" "}
                {selectedTruck.driver.first_name} {selectedTruck.driver.middle_name}{" "}
                {selectedTruck.driver.last_name}
              </p>
              <p>
                <strong>Contact:</strong> +63
                {selectedTruck.driver.contact_number || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruckMap;
