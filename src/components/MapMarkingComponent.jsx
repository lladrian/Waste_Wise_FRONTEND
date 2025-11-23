import React, { useEffect, useRef, useState } from 'react';

const markersData = [
  { id: 1, title: 'Ormoc City Hall', position: { lat: 11.0063, lng: 124.6075 } },
  { id: 2, title: 'Ormoc Port', position: { lat: 11.0150, lng: 124.6089 } },
  { id: 3, title: 'Lake Danao', position: { lat: 11.0719, lng: 124.6903 } },
  { id: 4, title: 'Test', position: { lat: 11.0027, lng: 124.6083 } },
  { id: 5, title: 'Test20', position: { lat: 11.0526464, lng: 124.5151232 } },
   { id: 6, title: 'Test30', position: { lat: 11.0992633, lng: 124.5545646 } },
      { id: 7, title: 'Test40', position: { lat:  11.0526464, lng: 124.5151232 } },


  
];

const MapComponent = () => {
  const mapRef = useRef(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [markers, setMarkers] = useState(markersData);
  const [newMarkerTitle, setNewMarkerTitle] = useState('');
  const mapInstanceRef = useRef(null);
  const infoWindowRef = useRef(null);

  useEffect(() => {
    if (!window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 11.0063, lng: 124.6075 }, // Ormoc City, Leyte, Philippines
      zoom: 11,
    });

    mapInstanceRef.current = map;
    infoWindowRef.current = new window.google.maps.InfoWindow();

    // Add click listener to map for adding new markers
    map.addListener('click', (event) => {
      const title = prompt('Enter a title for the new marker:');
      if (title) {
        addNewMarker(event.latLng, title);
      }
    });

    initializeMarkers(map);

  }, []);

  const initializeMarkers = (map) => {
    markers.forEach(marker => {
      createMarker(marker, map);
    });
  };

  const createMarker = (markerData, map) => {
    const mapMarker = new window.google.maps.Marker({
      position: markerData.position,
      map,
      title: markerData.title,
    });

    mapMarker.addListener('click', () => {
      setSelectedMarker(markerData);
      infoWindowRef.current.setContent(`<div><strong>${markerData.title}</strong></div>`);
      infoWindowRef.current.open(map, mapMarker);
    });

    return mapMarker;
  };

  const addNewMarker = (latLng, title) => {
    const newMarker = {
      id: Date.now(), // Simple ID generation
      title: title,
      position: { lat: latLng.lat(), lng: latLng.lng() }
    };

    // Add to state
    setMarkers(prev => [...prev, newMarker]);
    
    // Create the marker on the map
    createMarker(newMarker, mapInstanceRef.current);
    
    // Select the new marker
    setSelectedMarker(newMarker);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!newMarkerTitle.trim()) return;

    // Get current center of the map for the new marker
    const center = mapInstanceRef.current.getCenter();
    addNewMarker(center, newMarkerTitle);
    setNewMarkerTitle('');
  };

  const clearAllMarkers = () => {
    setMarkers(markersData);
    setSelectedMarker(null);
    // Note: In a real app, you'd want to remove markers from the map too
    // This would require keeping references to all marker instances
  };

  return (
    <div>
      {/* Marker Creation Form */}
      {/* <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Add New Marker</h3>
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            value={newMarkerTitle}
            onChange={(e) => setNewMarkerTitle(e.target.value)}
            placeholder="Enter marker title"
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }}
          />
          <button 
            type="submit" 
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add Marker at Center
          </button>
        </form>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          Or click anywhere on the map to add a marker at that location
        </p>
      </div> */}

      {/* Map */}
      <div
        ref={mapRef}
        style={{ height: '100vh', width: '100%', borderRadius: '8px' }}
      ></div>

      {/* Selected Marker Info */}
      {selectedMarker && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Selected Marker Info:</h3>
          <p><strong>ID:</strong> {selectedMarker.id}</p>
          <p><strong>Title:</strong> {selectedMarker.title}</p>
          <p><strong>Coordinates:</strong> {selectedMarker.position.lat.toFixed(4)}, {selectedMarker.position.lng.toFixed(4)}</p>
        </div>
      )}

      {/* Markers List */}
      <div style={{ marginTop: '20px' }}>
        <h3>All Markers ({markers.length})</h3>
        <ul>
          {markers.map(marker => (
            <li 
              key={marker.id} 
              style={{ 
                cursor: 'pointer', 
                padding: '5px',
                backgroundColor: selectedMarker?.id === marker.id ? '#f0f0f0' : 'transparent'
              }}
              onClick={() => setSelectedMarker(marker)}
            >
              {marker.title} - ({marker.position.lat.toFixed(2)}, {marker.position.lng.toFixed(2)})
            </li>
          ))}
        </ul>
        {markers.length > 0 && (
          <button 
            onClick={clearAllMarkers}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Clear All Markers
          </button>
        )}
      </div>
    </div>
  );
};

export default MapComponent;