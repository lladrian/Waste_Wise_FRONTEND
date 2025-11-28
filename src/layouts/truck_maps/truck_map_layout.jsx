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

  // FIX: Initialize as null instead of empty object
  const [selectedTruck, setSelectedTruck] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const ws = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  // WebSocket connection
  useEffect(() => {
    ws.current = new WebSocket("wss://waste-wise-backend-uzub.onrender.com");

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.name) {
        case "trucks":
          console.log("WebSocket received truck data:", message.data.length, "trucks");

          const filteredSchedules = message.data.filter(schedule => {
            if (!schedule.route || !schedule.route.merge_barangay) {
              return false;
            }
            return schedule.route.merge_barangay.some(barangay =>
              barangay.barangay_id.toString() === user?.barangay
            );
          });

          const list = user.role !== "barangay_official" ? message.data : filteredSchedules;

          // Log position updates for debugging
          list.forEach(record => {
            if (record.truck?.position) {
              console.log(`Truck ${record.truck.truck_id} position:`, record.truck.position);
            }
          });

          console.log("try - Checking selectedTruck:", selectedTruck);
          console.log("try - List data:", list);

          // FIX: Check if selectedTruck exists and has a truck_id
          if (selectedTruck && selectedTruck.truck_id) {
            console.log("try1 - Looking for truck:", selectedTruck.truck_id);

            const updatedSelectedTruck = list.find(record =>
              record.truck?.truck_id === selectedTruck.truck_id
            );

            console.log("try2 - Found updated truck:", updatedSelectedTruck);

            if (updatedSelectedTruck) {
              console.log("Updating selected truck with new data");
              setSelectedTruck({
                truck_id: updatedSelectedTruck.truck?.truck_id,
                status: updatedSelectedTruck.truck?.status || "N/A",
                schedule_status: updatedSelectedTruck.status || "N/A",
                remark: updatedSelectedTruck.remark || "None",
                garbage_type: updatedSelectedTruck.garbage_type || "N/A",
                scheduled_collection: updatedSelectedTruck.scheduled_collection || "N/A",
                route_name: updatedSelectedTruck.route?.route_name || "No route assigned",
                driver: updatedSelectedTruck.truck?.user || null,
                tasks: updatedSelectedTruck.task || [],
                garbage_sites: updatedSelectedTruck.garbage_sites?.[0] || [],
                position: updatedSelectedTruck.truck?.position || null,
              });
            } else {
              console.log("Selected truck not found in new data");
            }
          } else {
            console.log("No selected truck to update");
          }

          setRecords(list);
          setFilteredRecords(list);
          break;
        default:
          console.warn("Unknown data list:", message.name);
      }
    };

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    ws.current.onerror = (error) => {
      // console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [user?.barangay, user?.role, selectedTruck]);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Helper: get today in Philippine timezone (YYYY-MM-DD)
  function getTodayFormatted() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const philippinesTime = new Date(utc + 8 * 3600000);
    const year = philippinesTime.getFullYear();
    const month = String(philippinesTime.getMonth() + 1).padStart(2, "0");
    const day = String(philippinesTime.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data, success } = await getAllTruck(user?.barangay, getTodayFormatted());

      if (success) {
        const list = user.role !== "barangay_official" ? data.trucks : data.trucks2 || [];
        setRecords(list);
        setFilteredRecords(list);

        const uniqueStatuses = [
          "all",
          ...new Set(list.map((item) => (item.truck?.status || "Unknown").toLowerCase())),
        ];
        setStatusOptions(uniqueStatuses);
      }
    } catch (err) {
      console.error("Error fetching truck data:", err);
      toast.error("Failed to load truck data");
    } finally {
      setIsLoading(false);
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
      if (!window.google) {
        console.error("Google Maps not loaded");
        return;
      }

      try {
        const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");

        const center = { lat: 11.0064, lng: 124.6075 };
        const map = new window.google.maps.Map(document.getElementById("map"), {
          center,
          zoom: 12,
          mapId: "DEMO_MAP_ID",
        });

        mapRef.current = { map, AdvancedMarkerElement };
        setMapLoaded(true);
        console.log("Map initialized successfully");
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initMap();
  }, []);

  // Update markers when filteredRecords change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) {
      console.log("Map not ready for markers");
      return;
    }

    const { map, AdvancedMarkerElement } = mapRef.current;
    console.log("Updating markers with", filteredRecords.length, "trucks");

    const createMarkerContent = (truck, status) => {
      const iconImg = createStatusIcon(status);

      const markerDiv = document.createElement("div");
      markerDiv.style.display = "flex";
      markerDiv.style.flexDirection = "column";
      markerDiv.style.alignItems = "center";
      markerDiv.style.textAlign = "center";
      markerDiv.style.cursor = "pointer";

      const label = document.createElement("div");
      label.innerText = truck.truck_id || "N/A";
      label.style.backgroundColor = getStatusColor(status);
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

    const getStatusColor = (status) => {
      const s = (status || "").toLowerCase();
      switch (s) {
        case "active":
        case "on route":
          return "#ef4444"; // red
        case "inactive":
        case "under maintenance":
        case "unavailable":
          return "#3b82f6"; // blue
        case "complete":
          return "#10b981"; // green
        default:
          return "#6b7280"; // gray
      }
    };

    // Clear all existing markers first to ensure clean state
    Object.values(markersRef.current).forEach(marker => {
      if (marker && marker.map) {
        marker.map = null;
      }
    });
    markersRef.current = {};

    // Create new markers for all filtered records
    filteredRecords.forEach((record) => {
      const truck = record.truck;
      if (!truck) {
        console.log("No truck data for record:", record);
        return;
      }

      const lat = truck?.position?.lat;
      const lng = truck?.position?.lng;

      if (!lat || !lng) {
        console.log(`No position data for truck ${truck.truck_id}`);
        return;
      }

      console.log(`Creating marker for truck ${truck.truck_id} at`, { lat, lng });

      try {
        const content = createMarkerContent(truck, truck.status);

        const marker = new AdvancedMarkerElement({
          map,
          position: { lat, lng },
          title: `Truck ID: ${truck.truck_id}\nStatus: ${truck.status}\nPosition: ${lat}, ${lng}`,
          content,
        });

        marker.addListener("click", () => {
          console.log(`Marker clicked for truck ${truck.truck_id}`);
          setSelectedTruck({
            truck_id: truck.truck_id,
            status: truck.status || "N/A",
            schedule_status: record.status || "N/A",
            remark: record.remark || "None",
            garbage_type: record.garbage_type || "N/A",
            scheduled_collection: record.scheduled_collection || "N/A",
            route_name: record.route?.route_name || "No route assigned",
            driver: truck.user || null,
            tasks: record.task || [],
            garbage_sites: record.garbage_sites?.[0] || [],
            position: truck.position || null,
          });
        });

        markersRef.current[truck.truck_id] = marker;
      } catch (error) {
        console.error(`Error creating marker for truck ${truck.truck_id}:`, error);
      }
    });

    console.log("Markers created:", Object.keys(markersRef.current).length);

  }, [filteredRecords, mapLoaded]);

  // Helper functions
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

  const getDriverName = (driver) => {
    if (!driver) return "No driver assigned";
    return `${driver.first_name || ""} ${driver.middle_name || ""} ${driver.last_name || ""}`.trim();
  };

  const formatContactNumber = (number) => {
    if (!number) return "N/A";
    return `+63 ${number}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const closeModal = () => setSelectedTruck(null);

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      {/* <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Live Truck Tracking</h1>
            <p className="text-gray-600">Real-time monitoring of garbage collection trucks</p>
            <p className="text-sm text-blue-600">
              {mapLoaded ? "Map loaded ✓" : "Loading map..."} | 
              WebSocket: {ws.current?.readyState === 1 ? "Connected ✓" : "Connecting..."} |
              Selected Truck: {selectedTruck ? selectedTruck.truck_id : "None"}
            </p> 
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>
      </div> */}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
          <div className="text-sm font-medium text-gray-600">On Route</div>
          <div className="text-2xl font-bold text-gray-800">
            {records.filter(r => (r.truck?.status || "").toLowerCase() === "on route").length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="text-sm font-medium text-gray-600">Available</div>
          <div className="text-2xl font-bold text-gray-800">
            {records.filter(r => (r.truck?.status || "").toLowerCase() === "active").length}
          </div>
        </div>
        {/* <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="text-sm font-medium text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-gray-800">
            {records.filter(r => (r.truck?.status || "").toLowerCase() === "complete").length}
          </div>
        </div> */}
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-500">
          <div className="text-sm font-medium text-gray-600">Total Trucks</div>
          <div className="text-2xl font-bold text-gray-800">{records.length}</div>
        </div>
      </div>

      <div className="relative">
        {/* Map container */}
        <div id="map" className="w-full h-[500px] rounded shadow mb-6 border-2 border-gray-300" />

        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        )}

        {/* All Trucks Data Display */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            All Trucks Information ({filteredRecords.length} trucks)
          </h2>

          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No trucks found for the selected status.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecords.map((record, index) => (
                <div
                  key={record._id || index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedTruck({
                    truck_id: record.truck?.truck_id,
                    status: record.truck?.status || "N/A",
                    schedule_status: record.status || "N/A",
                    remark: record.remark || "None",
                    garbage_type: record.garbage_type || "N/A",
                    scheduled_collection: record.scheduled_collection || "N/A",
                    route_name: record.route?.route_name || "No route assigned",
                    driver: record.truck?.user || null,
                    tasks: record.task || [],
                    garbage_sites: record.garbage_sites?.[0] || [],
                    position: record.truck?.position || null,
                  })}
                >
                  {/* Truck Header */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-gray-800">
                      {record.truck?.truck_id || "Unknown Truck"}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${(record.truck?.status || "").toLowerCase() === 'on route'
                      ? 'bg-red-100 text-red-800'
                      : (record.truck?.status || "").toLowerCase() === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                      }`}>
                      {record.truck?.status || "Unknown"}
                    </span>
                  </div>

                  {/* Truck Details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Route:</span>
                      <span className="font-medium text-gray-800">{record.route?.route_name || "N/A"}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Garbage Type:</span>
                      <span className="font-medium text-gray-800">{record.garbage_type || "N/A"}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Scheduled:</span>
                      <span className="font-medium text-gray-800">{formatDate(record.scheduled_collection)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Schedule Status:</span>
                      <span className="font-medium text-gray-800">{record.status || "N/A"}</span>
                    </div>

                    {/* Driver Information */}
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex justify-between">
                        <span>Driver:</span>
                        <span className="font-medium text-gray-800">{getDriverName(record.truck?.user)}</span>
                      </div>

                      {record.truck?.user?.contact_number && (
                        <div className="flex justify-between">
                          <span>Contact:</span>
                          <span className="font-medium text-gray-800">
                            {formatContactNumber(record.truck.user.contact_number)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tasks Summary */}
                    {record.task && record.task.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex justify-between">
                          <span>Tasks:</span>
                          <span className="font-medium text-gray-800">
                            {record.task.filter(t => t.status === 'Complete').length} / {record.task.length} completed
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Click Hint */}
                  <div className="mt-3 text-xs text-blue-600 text-center">
                    Click for full details
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for selected truck */}
      {selectedTruck && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded-md shadow-lg w-[620px] relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-3">
              Truck ID: {selectedTruck.truck_id}
            </h2>

            {/* Truck Details */}
            <div className="space-y-1 text-sm">
              <p><strong>Status:</strong> {selectedTruck.status}</p>
              {selectedTruck.position && (
                <p><strong>Position:</strong> {selectedTruck.position.lat.toFixed(6)}, {selectedTruck.position.lng.toFixed(6)}</p>
              )}
              <p><strong>Route:</strong> {selectedTruck.route_name}</p>
              <p><strong>Garbage Type:</strong> {selectedTruck.garbage_type}</p>
              <p><strong>Scheduled Date:</strong> {selectedTruck.scheduled_collection}</p>
              <p><strong>Schedule Status:</strong> {selectedTruck.schedule_status}</p>
              <p><strong>Remark:</strong> {selectedTruck.remark}</p>
            </div>

            <hr className="my-3" />

            {/* Driver Details */}
            <h3 className="font-semibold text-md mb-1">Driver Information</h3>
            {selectedTruck.driver ? (
              <div className="text-sm space-y-1">
                <p><strong>Name:</strong> {selectedTruck.driver.first_name} {selectedTruck.driver.middle_name} {selectedTruck.driver.last_name}</p>
                <p><strong>Gender:</strong> {selectedTruck.driver.gender}</p>
                <p><strong>Contact:</strong> +63{selectedTruck.driver.contact_number}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No driver assigned</p>
            )}

            <hr className="my-3" />

            {/* === TASKS === */}
            <h3 className="font-semibold text-md mb-1">Task Progress</h3>

            {selectedTruck.tasks.length > 0 ? (
              <table className="w-full text-sm border rounded-md overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-3 py-2 border w-3/4">Barangay</th>
                    <th className="px-3 py-2 border w-1/4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTruck.tasks.map((t) => (
                    <tr key={t._id} className="odd:bg-white even:bg-gray-50">
                      <td className="px-3 py-2 border overflow-hidden">
                        <div className="truncate max-w-[400px]">
                          {t.barangay_id?.barangay_name || "Unknown"}
                        </div>
                      </td>
                      <td className="px-3 py-2 border font-semibold">
                        {t.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500">No assigned tasks</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TruckMap;