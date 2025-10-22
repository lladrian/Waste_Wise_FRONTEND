import React, { useEffect, useState, useContext } from "react";
import { toast } from "react-toastify";
import { getAllTruck } from "../../hooks/truck_map_hook";
import { AuthContext } from "../../context/AuthContext";

const TruckMap = () => {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null); // For modal

  useEffect(() => {
    fetchData();
  }, []);

  function getTodayFormatted() {
    const now = new Date();

    // Convert to Philippine timezone offset (UTC+8)
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const philippinesTime = new Date(utc + 8 * 3600000);

    // Format as YYYY-MM-DD
    const year = philippinesTime.getFullYear();
    const month = String(philippinesTime.getMonth() + 1).padStart(2, '0');
    const day = String(philippinesTime.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const fetchData = async () => {
    try {
      const { data, success } = await getAllTruck(user?.barangay, getTodayFormatted());

      if (success) {
        // console.log(data.trucks2)
        const list = user.role !== 'barangay_official' ? data.trucks : (data.trucks2 || []);
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

  useEffect(() => {
    const loadMap = async () => {
      if (!window.google) return;
      const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");

      const first = filteredRecords.find(
        (r) => r.truck?.position?.lat && r.truck?.position?.lng
      );
      const center = first
        ? { lat: first.truck.position.lat, lng: first.truck.position.lng }
        : { lat: 11.0064, lng: 124.6075 }; // Default Ormoc City

      const map = new window.google.maps.Map(document.getElementById("map"), {
        center,
        zoom: 12,
        mapId: "DEMO_MAP_ID",
      });

      filteredRecords.forEach((record) => {
        const truck = record.truck;
        const route = record.route;
        const lat = truck?.position?.lat;
        const lng = truck?.position?.lng;

        if (!lat || !lng) return;

        // --- 🔹 Create Truck ID label + colored icon
        const iconImg = createStatusIcon(truck.status);

        const markerDiv = document.createElement("div");
        markerDiv.style.display = "flex";
        markerDiv.style.flexDirection = "column";
        markerDiv.style.alignItems = "center";
        markerDiv.style.textAlign = "center";

        // Label showing Truck ID
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

        const marker = new AdvancedMarkerElement({
          map,
          position: { lat, lng },
          title: `Truck ID: ${truck.truck_id}`,
          content: markerDiv,
        });

        // Open modal when marker clicked
        marker.addListener("click", () => {
          setSelectedTruck({
            truck_id: truck.truck_id,
            status: truck.status || "N/A",
            route_name: route?.route_name || "No route assigned",
            garbage_type: record.garbage_type || "N/A",
            scheduled_collection: record.scheduled_collection || "N/A",
            driver: truck.user || {},
            remark: record.remark || "None",
          });
        });
      });
    };

    loadMap();
  }, [filteredRecords]);

  // Truck status icons
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
      {/* Map */}
      <div id="map" className="w-full h-[500px] rounded shadow" />

      {/* Modal */}
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
