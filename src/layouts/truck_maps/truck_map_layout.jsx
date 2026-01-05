import React, { useEffect, useState, useContext, useRef } from "react";
import { toast } from "react-toastify";
import { getAllTruck } from "../../hooks/truck_map_hook";
import { AuthContext } from "../../context/AuthContext";
import {
  FiFilter,
  FiTruck,
  FiMap,
  FiUser,
  FiCalendar,
  FiRefreshCw,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiX
} from "react-icons/fi";

import TruckIcon from '../../assets/truck.png';

const TruckMap = () => {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [statusOptions, setStatusOptions] = useState([]);

  const [selectedTruck, setSelectedTruck] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState({
    status: "all",
    garbageType: "all",
    routeName: "all",
    driverName: "all",
    scheduleStatus: "all",
    dateRange: "all"
  });

  const [availableFilters, setAvailableFilters] = useState({
    garbageTypes: [],
    routeNames: [],
    driverNames: [],
    scheduleStatuses: [],
    dateRanges: []
  });

  const ws = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const polylinesRef = useRef({});

  // WebSocket connection - ADDED BACK
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

          // Update available filters based on new data
          updateAvailableFilters(list);

          // Log position updates for debugging
          list.forEach(record => {
            if (record.truck?.position) {
              console.log(`Truck ${record.truck.truck_id} position:`, record.truck.position);
            }
          });

          console.log("try - Checking selectedTruck:", selectedTruck);
          console.log("try - List data:", list);

          // Check if selectedTruck exists and has a truck_id
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
                recurring_day: updatedSelectedTruck.recurring_day || "N/A",
                route_name: updatedSelectedTruck.route?.route_name || "No route assigned",
                driver: updatedSelectedTruck.truck?.user || null,
                tasks: updatedSelectedTruck.task || [],
                garbage_sites: updatedSelectedTruck.garbage_sites?.[0] || [],
                position: updatedSelectedTruck.truck?.position || null,
                route_points: updatedSelectedTruck.route?.route_points || [],
                polyline_color: updatedSelectedTruck.route?.polyline_color || "#00008B",
                heading: updatedSelectedTruck.truck?.heading || 0,
              });
            } else {
              console.log("Selected truck not found in new data");
            }
          } else {
            console.log("No selected truck to update");
          }

          setRecords(list);
          // Apply current filters to new data
          applyFilters(list, filters, searchTerm);
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

  function getTodayFormatted() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const philippinesTime = new Date(utc + 8 * 3600000);
    const year = philippinesTime.getFullYear();
    const month = String(philippinesTime.getMonth() + 1).padStart(2, "0");
    const day = String(philippinesTime.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getTodayDayName() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const philippinesTime = new Date(utc + 8 * 3600000);

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[philippinesTime.getDay()];

    return dayName.toLowerCase();
  }

  const updateAvailableFilters = (data) => {
    const garbageTypes = ["all", ...new Set(data.map(item => item.garbage_type || "Unknown"))];
    const routeNames = ["all", ...new Set(data.map(item => item.route?.route_name || "No Route"))];
    const driverNames = ["all", ...new Set(data.map(item =>
      item.truck?.user ?
        `${item.truck.user.first_name} ${item.truck.user.last_name}`.trim() :
        "No Driver"
    ))];
    const scheduleStatuses = ["all", ...new Set(data.map(item => item.status || "Unknown"))];

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateRanges = [
      { value: "all", label: "All Dates" },
      { value: "today", label: "Today" },
    ];

    setAvailableFilters({
      garbageTypes,
      routeNames,
      driverNames,
      scheduleStatuses,
      dateRanges
    });
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data, success } = await getAllTruck(user?.barangay, getTodayDayName());

      if (success) {
        const list = user.role !== "barangay_official" ? data.trucks : data.trucks2 || [];

        await initMap(list[0]?.truck?.position?.lat, list[0]?.truck?.position?.lng);

        updateAvailableFilters(list);

        setRecords(list);
        applyFilters(list, filters, searchTerm);

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

  const applyFilters = (data, filterState, search) => {
    let filtered = [...data];

    if (search) {
      filtered = filtered.filter(record => {
        const searchLower = search.toLowerCase();
        return (
          record.truck?.truck_id?.toLowerCase().includes(searchLower) ||
          record.route?.route_name?.toLowerCase().includes(searchLower) ||
          record.garbage_type?.toLowerCase().includes(searchLower) ||
          record.status?.toLowerCase().includes(searchLower) ||
          (record.truck?.user &&
            `${record.truck.user.first_name} ${record.truck.user.last_name}`
              .toLowerCase().includes(searchLower))
        );
      });
    }

    if (filterState.status !== "all") {
      filtered = filtered.filter(
        (r) => (r.truck?.status || "").toLowerCase() === filterState.status.toLowerCase()
      );
    }

    if (filterState.garbageType !== "all") {
      filtered = filtered.filter(
        (r) => r.garbage_type === filterState.garbageType
      );
    }

    if (filterState.routeName !== "all") {
      filtered = filtered.filter(
        (r) => r.route?.route_name === filterState.routeName
      );
    }

    if (filterState.driverName !== "all") {
      filtered = filtered.filter(record => {
        const driverName = record.truck?.user ?
          `${record.truck.user.first_name} ${record.truck.user.last_name}`.trim() :
          "No Driver";
        return driverName === filterState.driverName;
      });
    }

    if (filterState.scheduleStatus !== "all") {
      filtered = filtered.filter(
        (r) => r.status === filterState.scheduleStatus
      );
    }

    setFilteredRecords(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    applyFilters(records, newFilters, searchTerm);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(records, filters, value);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      status: "all",
      garbageType: "all",
      routeName: "all",
      driverName: "all",
      scheduleStatus: "all",
      dateRange: "all"
    };
    setFilters(clearedFilters);
    setSearchTerm("");
    applyFilters(records, clearedFilters, "");
  };

  const isAnyFilterActive = () => {
    return Object.values(filters).some(filter => filter !== "all") || searchTerm;
  };

  const initMap = async (latitude, longitude) => {
    if (!window.google) {
      console.error("Google Maps not loaded");
      return;
    }

    try {
      const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");

      const center = { lat: latitude || 11.0064, lng: longitude || 124.6075 };

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

  const drawRoutePolyline = (record) => {
    if (!mapRef.current || !mapRef.current.map) return null;

    const route = record.route;
    if (!route || !route.route_points || route.route_points.length < 2) {
      console.log(`No route points for truck ${record.truck?.truck_id}`);
      return null;
    }

    try {
      const path = route.route_points.map(point =>
        new window.google.maps.LatLng(point.lat, point.lng)
      );

      const polyline = new window.google.maps.Polyline({
        path: path,
        strokeColor: route.polyline_color || "#00008B",
        strokeOpacity: 0.6,
        strokeWeight: 4,
        map: mapRef.current.map,
        geodesic: true
      });

      return polyline;
    } catch (error) {
      console.error(`Error drawing route for truck ${record.truck?.truck_id}:`, error);
      return null;
    }
  };

  // Update markers and routes when filteredRecords change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) {
      console.log("Map not ready for markers");
      return;
    }

    const { map, AdvancedMarkerElement } = mapRef.current;
    console.log("Updating markers with", filteredRecords.length, "trucks");

    const createMarkerContent = (truck, status, heading = 0) => {
      const markerDiv = document.createElement("div");
      markerDiv.style.display = "flex";
      markerDiv.style.flexDirection = "column";
      markerDiv.style.alignItems = "center";
      markerDiv.style.textAlign = "center";
      markerDiv.style.cursor = "pointer";
      markerDiv.style.position = "relative";

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
      label.style.position = "absolute";
      label.style.top = "-30px";
      label.style.left = "50%";
      label.style.transform = "translateX(-50%)";
      label.style.zIndex = "1000";

      const iconContainer = document.createElement("div");
      iconContainer.style.position = "relative";
      iconContainer.style.width = "45px";
      iconContainer.style.height = "45px";
      
      const iconImg = document.createElement("img");
      // iconImg.src = TruckIcon;
      iconImg.src = "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
      iconImg.style.width = "100%";
      iconImg.style.height = "100%";
      // iconImg.style.transform = `rotate(${heading}deg)`;
      // iconImg.style.transformOrigin = "center";
      // iconImg.style.transition = "transform 0.3s ease";
      
      iconImg.onerror = () => {
        console.error("Failed to load truck icon");
        iconImg.src = "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
      };
      
      iconContainer.appendChild(iconImg);
      markerDiv.appendChild(label);
      markerDiv.appendChild(iconContainer);

      return markerDiv;
    };

    const getStatusColor = (status) => {
      const s = (status || "").toLowerCase();
      switch (s) {
        case "active":
        case "on route":
          return "#ef4444";
        case "inactive":
        case "under maintenance":
        case "unavailable":
          return "#3b82f6";
        case "complete":
          return "#10b981";
        default:
          return "#6b7280";
      }
    };

    Object.values(markersRef.current).forEach(marker => {
      if (marker && marker.map) {
        marker.map = null;
      }
    });
    markersRef.current = {};

    Object.values(polylinesRef.current).forEach(polyline => {
      if (polyline && polyline.setMap) {
        polyline.setMap(null);
      }
    });
    polylinesRef.current = {};

    filteredRecords.forEach((record) => {
      const truck = record.truck;
      if (!truck) {
        console.log("No truck data for record:", record);
        return;
      }

      const lat = truck?.position?.lat;
      const lng = truck?.position?.lng;
      const heading = truck?.heading || 0;

      if (!lat || !lng) {
        console.log(`No position data for truck ${truck.truck_id}`);
        return;
      }

      console.log(`Creating marker for truck ${truck.truck_id} at`, { lat, lng, heading });

      try {
        if (record.route?.route_points && record.route.route_points.length >= 2) {
          const polyline = drawRoutePolyline(record);
          if (polyline) {
            polylinesRef.current[truck.truck_id] = polyline;
          }
        }

        const content = createMarkerContent(truck, truck.status, heading);

        const marker = new AdvancedMarkerElement({
          map,
          position: { lat, lng },
          title: `Truck ID: ${truck.truck_id}\nStatus: ${truck.status}\nPosition: ${lat}, ${lng}\nHeading: ${heading}°`,
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
            recurring_day: record.recurring_day || "N/A",
            route_name: record.route?.route_name || "No route assigned",
            driver: truck.user || null,
            tasks: record.task || [],
            garbage_sites: record.garbage_sites?.[0] || [],
            position: truck.position || null,
            route_points: record.route?.route_points || [],
            polyline_color: record.route?.polyline_color || "#00008B",
            heading: heading,
          });
        });

        markersRef.current[truck.truck_id] = marker;
      } catch (error) {
        console.error(`Error creating marker for truck ${truck.truck_id}:`, error);
      }
    });

    console.log("Markers created:", Object.keys(markersRef.current).length);
    console.log("Routes drawn:", Object.keys(polylinesRef.current).length);

  }, [filteredRecords, mapLoaded]);

  // Update existing markers when heading changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !filteredRecords.length) return;

    filteredRecords.forEach((record) => {
      const truck = record.truck;
      if (!truck) return;

      const marker = markersRef.current[truck.truck_id];
      if (marker && marker.content) {
        const heading = truck.heading || 0;
        
        const iconImg = marker.content.querySelector('img');
        // if (iconImg) {
        //   iconImg.style.transform = `rotate(${heading}deg)`;
        // }
        
        marker.title = `Truck ID: ${truck.truck_id}\nStatus: ${truck.status}\nPosition: ${truck.position?.lat}, ${truck.position?.lng}\nHeading: ${heading}°`;
      }
    });
  }, [filteredRecords]);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Live Truck Tracking</h1>
          <p className="text-gray-600">Real-time monitoring of garbage collection trucks</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? "Loading..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
          <div className="flex items-center space-x-2 mb-2">
            <FiTruck className="w-5 h-5 text-red-500" />
            <div className="text-sm font-medium text-gray-600">On Route</div>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {records.filter(r => (r.truck?.status || "").toLowerCase() === "on route").length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="flex items-center space-x-2 mb-2">
            <FiTruck className="w-5 h-5 text-blue-500" />
            <div className="text-sm font-medium text-gray-600">Available</div>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {records.filter(r => (r.truck?.status || "").toLowerCase() === "active").length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-500">
          <div className="flex items-center space-x-2 mb-2">
            <FiTruck className="w-5 h-5 text-gray-500" />
            <div className="text-sm font-medium text-gray-600">Trucks</div>
          </div>
          <div className="text-2xl font-bold text-gray-800">{records.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => setShowFilters(!showFilters)}
        >
          <div className="flex items-center space-x-3">
            <FiFilter className="w-5 h-5 text-gray-500" />
            <div>
              <h3 className="font-semibold text-gray-800">Filters & Search</h3>
              <p className="text-sm text-gray-500">
                {isAnyFilterActive()
                  ? "Active filters applied"
                  : "Filter trucks by various criteria"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isAnyFilterActive() && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearAllFilters();
                }}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiX className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
            {showFilters ? (
              <FiChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <FiChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>

        {showFilters && (
          <div className="p-4 border-t border-gray-200 space-y-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search trucks by ID, route, driver, or type..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiTruck className="inline-block w-4 h-4 mr-1" />
                  Truck Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Status</option>
                  {statusOptions
                    .filter(status => status !== "all")
                    .map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiTruck className="inline-block w-4 h-4 mr-1" />
                  Garbage Type
                </label>
                <select
                  value={filters.garbageType}
                  onChange={(e) => handleFilterChange("garbageType", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {availableFilters.garbageTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "all" ? "All Types" : type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMap className="inline-block w-4 h-4 mr-1" />
                  Route Name
                </label>
                <select
                  value={filters.routeName}
                  onChange={(e) => handleFilterChange("routeName", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {availableFilters.routeNames.map((route) => (
                    <option key={route} value={route}>
                      {route === "all" ? "All Routes" : route}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isAnyFilterActive() && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.status !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Status: {filters.status}
                      <button
                        onClick={() => handleFilterChange("status", "all")}
                        className="ml-2 hover:text-red-600"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.garbageType !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Type: {filters.garbageType}
                      <button
                        onClick={() => handleFilterChange("garbageType", "all")}
                        className="ml-2 hover:text-blue-600"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.routeName !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Route: {filters.routeName}
                      <button
                        onClick={() => handleFilterChange("routeName", "all")}
                        className="ml-2 hover:text-green-600"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.driverName !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Driver: {filters.driverName}
                      <button
                        onClick={() => handleFilterChange("driverName", "all")}
                        className="ml-2 hover:text-purple-600"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.scheduleStatus !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Schedule: {filters.scheduleStatus}
                      <button
                        onClick={() => handleFilterChange("scheduleStatus", "all")}
                        className="ml-2 hover:text-yellow-600"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.dateRange !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Date: {availableFilters.dateRanges.find(d => d.value === filters.dateRange)?.label}
                      <button
                        onClick={() => handleFilterChange("dateRange", "all")}
                        className="ml-2 hover:text-indigo-600"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Search: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm("")}
                        className="ml-2 hover:text-gray-600"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-600">
              Showing {filteredRecords.length} of {records.length} trucks
            </span>
            {isAnyFilterActive() && (
              <p className="text-sm text-blue-600 mt-1">
                Filters applied: {Object.values(filters).filter(f => f !== "all").length} filter(s)
                {searchTerm && " + search"}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Map: {mapLoaded ? "Ready" : "Loading..."} |
              WebSocket: {ws.current?.readyState === 1 ? "Connected" : "Connecting"}
            </span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div id="map" className="w-full h-[500px] rounded-xl shadow-lg mb-6 border border-gray-300" />

        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 rounded-xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Trucks Information ({filteredRecords.length} trucks)
          </h2>

          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <FiTruck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No trucks found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {isAnyFilterActive()
                  ? "Try adjusting your filters or search term to find trucks"
                  : "No trucks are currently active or scheduled"}
              </p>
              {isAnyFilterActive() && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecords.map((record, index) => (
                <div
                  key={record._id || index}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300 bg-gradient-to-br from-white to-gray-50"
                  onClick={() => setSelectedTruck({
                    truck_id: record.truck?.truck_id,
                    status: record.truck?.status || "N/A",
                    schedule_status: record.status || "N/A",
                    remark: record.remark || "None",
                    garbage_type: record.garbage_type || "N/A",
                    recurring_day: record.recurring_day || "N/A",
                    route_name: record.route?.route_name || "No route assigned",
                    driver: record.truck?.user || null,
                    tasks: record.task || [],
                    garbage_sites: record.garbage_sites?.[0] || [],
                    position: record.truck?.position || null,
                    route_points: record.route?.route_points || [],
                    polyline_color: record.route?.polyline_color || "#00008B",
                    heading: record.truck?.heading || 0,
                  })}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {record.truck?.truck_id || "Unknown Truck"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{record.route?.route_name || "No route"}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${(record.truck?.status || "").toLowerCase() === 'on route'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : (record.truck?.status || "").toLowerCase() === 'active'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-green-100 text-green-800 border border-green-200'
                      }`}>
                      {record.truck?.status || "Unknown"}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-500 block text-xs">Garbage Type</span>
                        <span className="font-medium text-gray-800">{record.garbage_type || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Scheduled Day</span>
                        <span className="font-medium text-gray-800">
                          {Array.isArray(record.recurring_day) &&
                            record.recurring_day
                              .map(
                                (day) => day.charAt(0).toUpperCase() + day.slice(1)
                              )
                              .join(", ")}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-500 block text-xs">Schedule Status</span>
                      <span className={`font-medium ${record.status === 'Scheduled' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {record.status || "N/A"}
                      </span>
                    </div>

                    {record.route?.route_points && record.route.route_points.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <FiMap className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-500">Route Points:</span>
                          <span className="font-medium text-gray-800">
                            {record.route.route_points.length} points
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-2 mb-2">
                        <FiUser className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-500">Driver</span>
                      </div>
                      <div className="text-gray-800 font-medium">
                        {getDriverName(record.truck?.user)}
                      </div>
                      {record.truck?.user?.contact_number && (
                        <div className="text-sm text-gray-600 mt-1">
                          {formatContactNumber(record.truck.user.contact_number)}
                        </div>
                      )}
                    </div>

                    {record.task && record.task.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <FiCalendar className="w-4 h-4 text-green-500" />
                          <span className="text-gray-500">Tasks</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Completion</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-800">
                              {record.task.filter(t => t.status === 'Complete').length} / {record.task.length}
                            </span>
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{
                                  width: `${(record.task.filter(t => t.status === 'Complete').length / record.task.length) * 100}%`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-center space-x-1 text-xs text-blue-600">
                      <span>Click for full details</span>
                      <FiChevronDown className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedTruck && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
            >
              <FiX className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiTruck className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Truck ID: {selectedTruck.truck_id}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedTruck.status === 'On Route'
                    ? 'bg-red-100 text-red-800'
                    : selectedTruck.status === 'Active'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                    }`}>
                    {selectedTruck.status}
                  </span>
                  {selectedTruck.position && (
                    <span className="text-sm text-gray-500">
                      Position: {selectedTruck.position.lat.toFixed(4)}, {selectedTruck.position.lng.toFixed(4)}
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    Heading: {selectedTruck.heading}°
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                    <FiMap className="w-4 h-4 mr-2" />
                    Route Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Route Name:</strong> {selectedTruck.route_name}</p>
                    {selectedTruck.polyline_color && (
                      <div className="flex items-center space-x-2">
                        <strong>Route Color:</strong>
                        <div
                          className="w-6 h-6 rounded-full border border-gray-300"
                          style={{ backgroundColor: selectedTruck.polyline_color }}
                        />
                        <span>{selectedTruck.polyline_color}</span>
                      </div>
                    )}
                    {selectedTruck.route_points && selectedTruck.route_points.length > 0 && (
                      <p><strong>Route Points:</strong> {selectedTruck.route_points.length} points</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                    <FiTruck className="w-4 h-4 mr-2" />
                    Schedule Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Garbage Type:</strong> {selectedTruck.garbage_type}</p>
                    <p>
                      <strong>Scheduled Day:</strong>{" "}
                      {Array.isArray(selectedTruck.recurring_day)
                        ? selectedTruck.recurring_day
                          .map(
                            (day) => day.charAt(0).toUpperCase() + day.slice(1)
                          )
                          .join(", ")
                        : ""}
                    </p>
                    <p><strong>Schedule Status:</strong> {selectedTruck.schedule_status}</p>
                    <p><strong>Remark:</strong> {selectedTruck.remark}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                  <FiUser className="w-4 h-4 mr-2" />
                  Driver Information
                </h3>
                {selectedTruck.driver ? (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <strong className="text-gray-600">Name:</strong>
                      <p className="text-gray-800">
                        {selectedTruck.driver.first_name} {selectedTruck.driver.middle_name} {selectedTruck.driver.last_name}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong className="text-gray-600">Gender:</strong>
                        <p className="text-gray-800">
                          {selectedTruck.driver.gender.charAt(0).toUpperCase() + selectedTruck.driver.gender.slice(1)}
                        </p>
                      </div>
                      <div>
                        <strong className="text-gray-600">Contact:</strong>
                        <p className="text-gray-800">+63{selectedTruck.driver.contact_number}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-gray-500">No driver assigned</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                <FiCalendar className="w-4 h-4 mr-2" />
                Task Progress ({selectedTruck.tasks.length} tasks)
              </h3>

              {selectedTruck.tasks.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-4 py-3 border-b font-medium text-gray-700">Barangay</th>
                        <th className="px-4 py-3 border-b font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTruck.tasks.map((t) => (
                        <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 border-b">
                            <div className="max-w-[300px] truncate">
                              {t.barangay_id?.barangay_name || "Unknown"}
                            </div>
                          </td>
                          <td className="px-4 py-3 border-b">
                            <span className={`font-semibold ${t.status === 'Complete'
                              ? 'text-green-600'
                              : t.status === 'Pending'
                                ? 'text-yellow-600'
                                : 'text-blue-600'
                              }`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No assigned tasks</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruckMap;