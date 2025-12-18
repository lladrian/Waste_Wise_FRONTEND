import React, { useEffect, useState, useContext, useRef } from "react";
import { toast } from "react-toastify";
import { getAllTruck } from "../hooks/truck_map_hook";
import { AuthContext } from "../context/AuthContext";
import TruckIcon from '../assets/truck.png'; // Import your truck icon

const MapLocationMarkerRealtime = ({ truck_id = null, display_type = "all" }) => {
    const { user } = useContext(AuthContext);
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedTruck, setSelectedTruck] = useState(null);

    const ws = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef({});

    /** 🔹 Establish WebSocket connection */
    useEffect(() => {
        ws.current = new WebSocket("wss://waste-wise-backend-uzub.onrender.com");

        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.name === "trucks") {
                const filteredSchedulesBarangay = message.data.filter((schedule) => {
                    if (!schedule.route || !schedule.route.merge_barangay) return false;

                    return schedule.route.merge_barangay.some(
                        (barangay) => barangay.barangay_id.toString() === user?.barangay?._id
                    );
                });

                const filteredSchedulesCollector = message.data.filter((schedule) => {
                    if (!schedule.truck || !schedule.truck._id) {
                        return false;
                    }

                    // Compare truck _id with user_id
                    return schedule.truck._id.toString() === truck_id.toString();
                });

                let list;
                if (display_type === "all") {
                    list = message.data;
                } else if (display_type === "barangay_official") {
                    list = filteredSchedulesBarangay;
                } else if (display_type === "garbage_collector") {
                    list = filteredSchedulesCollector;
                }

                setRecords(list);
                setFilteredRecords(list);
            } else {
                console.warn("Unknown data list:", message.name);
            }
        };

        ws.current.onopen = () => {
            console.log("✅ WebSocket connected");
        };

        ws.current.onclose = () => {
            console.log("❌ WebSocket disconnected");
        };

        return () => {
            if (ws.current) ws.current.close();
        };
    }, []);

    /** 🔹 Fetch initial data */
    useEffect(() => {
        fetchData();
    }, []);

    /** Helper: get today's date in Philippine timezone */
    const getTodayFormatted = () => {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const philippinesTime = new Date(utc + 8 * 3600000);
        const year = philippinesTime.getFullYear();
        const month = String(philippinesTime.getMonth() + 1).padStart(2, "0");
        const day = String(philippinesTime.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    function getTodayDayName() {
        const now = new Date();
        // Convert to Philippines time (UTC+8)
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const philippinesTime = new Date(utc + 8 * 3600000);

        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = days[philippinesTime.getDay()];

        return dayName.toLowerCase();
    }

    const fetchData = async () => {
        try {
            const { data, success } = await getAllTruck(user?.barangay, getTodayDayName());

            if (success) {
                const filteredSchedulesCollector = data.trucks.filter((schedule) => {
                    // Check if schedule has a truck and truck has an _id
                    if (!schedule.truck || !schedule.truck._id) {
                        return false;
                    }

                    // Compare truck _id with truck_id
                    return schedule.truck._id.toString() === truck_id.toString();
                });

                let list;
                if (display_type === "all") {
                    list = data.trucks;
                } else if (display_type === "barangay_official") {
                    list = data.trucks2;
                } else if (display_type === "garbage_collector") {
                    list = filteredSchedulesCollector;
                }

                setRecords(list);
                setFilteredRecords(list);
            }
        } catch (err) {
            console.error("Error fetching truck data:", err);
            toast.error("Failed to load truck data");
        }
    };

    /** 🔹 Filter records by status */
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

    /** 🔹 Initialize Google Map */
    useEffect(() => {
        const initMap = async () => {
            if (!window.google) return;
            const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");

            const center = { lat: 11.0064, lng: 124.6075 }; // Ormoc City
            const map = new window.google.maps.Map(document.getElementById("map"), {
                center,
                zoom: 11,
                mapId: "DEMO_MAP_ID",
            });

            mapRef.current = { map, AdvancedMarkerElement };
        };

        initMap();
    }, []);

    /** 🔹 Create marker content with proper rotation */
    const createMarkerContent = (truck, heading = 0) => {
        const markerDiv = document.createElement("div");
        markerDiv.style.display = "flex";
        markerDiv.style.flexDirection = "column";
        markerDiv.style.alignItems = "center";
        markerDiv.style.textAlign = "center";
        markerDiv.style.cursor = "pointer";
        markerDiv.style.position = "relative"; // Important for absolute positioning of label

        const label = document.createElement("div");
        label.innerText = truck.truck_id || "N/A";
        label.style.backgroundColor = getStatusColor(truck.status);
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
        iconImg.src = TruckIcon;
        iconImg.onerror = () => {
            console.error("Failed to load truck icon");
            iconImg.src = "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
        };
        iconImg.style.width = "100%";
        iconImg.style.height = "100%";
        iconImg.style.transform = `rotate(${heading}deg)`;
        iconImg.style.transformOrigin = "center";
        iconImg.style.transition = "transform 0.3s ease";
        
        iconContainer.appendChild(iconImg);
        markerDiv.appendChild(label);
        markerDiv.appendChild(iconContainer);

        return markerDiv;
    };

    /** 🔹 Get status color for label */
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

    /** 🔹 Update truck markers */
    useEffect(() => {
        if (!mapRef.current || !filteredRecords.length) return;
        const { map, AdvancedMarkerElement } = mapRef.current;

        // Clear old markers that are no longer in filteredRecords
        const currentTruckIds = filteredRecords.map((r) => r.truck?.truck_id);
        Object.keys(markersRef.current).forEach((truckId) => {
            if (!currentTruckIds.includes(truckId)) {
                markersRef.current[truckId].map = null;
                delete markersRef.current[truckId];
            }
        });

        // Create/update markers
        filteredRecords.forEach((record) => {
            const truck = record.truck;
            if (!truck) return;

            const lat = truck?.position?.lat;
            const lng = truck?.position?.lng;
            const heading = truck?.heading || 0;

            if (!lat || !lng) return;

            const existingMarker = markersRef.current[truck.truck_id];
            
            if (existingMarker) {
                // Update position
                existingMarker.position = { lat, lng };
                
                // Update heading rotation
                const iconImg = existingMarker.content.querySelector('img');
                if (iconImg) {
                    iconImg.style.transform = `rotate(${heading}deg)`;
                }
                
                // Update title with heading
                existingMarker.title = `Truck ID: ${truck.truck_id}\nStatus: ${truck.status}\nPosition: ${lat}, ${lng}\nHeading: ${heading}°`;
            } else {
                // Create new marker
                const content = createMarkerContent(truck, heading);
                const marker = new AdvancedMarkerElement({
                    map,
                    position: { lat, lng },
                    title: `Truck ID: ${truck.truck_id}\nStatus: ${truck.status}\nPosition: ${lat}, ${lng}\nHeading: ${heading}°`,
                    content,
                });

                marker.addListener("click", () => {
                    setSelectedTruck({
                        truck_id: truck.truck_id,
                        status: truck.status || "N/A",
                        heading: heading,
                        route_name: record.route?.route_name || "No route assigned",
                        garbage_type: record.garbage_type || "N/A",
                        recurring_day: record.recurring_day || "N/A",
                        driver: truck.user || {},
                        remark: record.remark || "None",
                        position: truck.position || null,
                    });
                });

                markersRef.current[truck.truck_id] = marker;
            }
        });

    }, [filteredRecords]);

    /** 🔹 Close truck info modal */
    const closeModal = () => setSelectedTruck(null);

    return (
        <div className="relative">
            {/* Map Container */}
            <div id="map" className="w-full h-[500px] rounded shadow" />

            {/* Truck Info Modal */}
            {selectedTruck && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                        >
                            ✕
                        </button>

                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                Truck ID: {selectedTruck.truck_id}
                            </h2>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    selectedTruck.status === 'On Route' 
                                    ? 'bg-red-100 text-red-800' 
                                    : selectedTruck.status === 'Active'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                    {selectedTruck.status}
                                </span>
                                {selectedTruck.heading !== undefined && (
                                    <span className="text-sm text-gray-500">
                                        Heading: {selectedTruck.heading}°
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 text-sm text-gray-700">
                            <div>
                                <strong className="text-gray-600">Route:</strong>
                                <p className="text-gray-800">{selectedTruck.route_name}</p>
                            </div>
                            
                            <div>
                                <strong className="text-gray-600">Garbage Type:</strong>
                                <p className="text-gray-800">{selectedTruck.garbage_type}</p>
                            </div>
                            
                            <div>
                                <strong className="text-gray-600">Scheduled Day:</strong>
                                <p className="text-gray-800">
                                    {Array.isArray(selectedTruck.recurring_day)
                                        ? selectedTruck.recurring_day
                                            .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
                                            .join(", ")
                                        : (selectedTruck.recurring_day?.charAt(0).toUpperCase() + selectedTruck.recurring_day?.slice(1) || "N/A")}
                                </p>
                            </div>
                            
                            <div>
                                <strong className="text-gray-600">Position:</strong>
                                <p className="text-gray-800">
                                    {selectedTruck.position 
                                        ? `${selectedTruck.position.lat.toFixed(4)}, ${selectedTruck.position.lng.toFixed(4)}`
                                        : "N/A"}
                                </p>
                            </div>
                            
                            <div>
                                <strong className="text-gray-600">Remark:</strong>
                                <p className="text-gray-800">{selectedTruck.remark}</p>
                            </div>

                            <hr className="my-2" />
                            
                            <div>
                                <strong className="text-gray-600">Driver:</strong>
                                <p className="text-gray-800">
                                    {selectedTruck.driver?.first_name} {selectedTruck.driver?.middle_name} {selectedTruck.driver?.last_name}
                                </p>
                            </div>
                            
                            <div>
                                <strong className="text-gray-600">Contact:</strong>
                                <p className="text-gray-800">
                                    +63{selectedTruck.driver?.contact_number || "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapLocationMarkerRealtime;