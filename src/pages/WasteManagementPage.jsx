// Example usage in a page
import React from 'react';
import MapComponent from '../components/MapComponent';

const WasteManagementPage = () => {
  const collectionPoints = [
    // { lat: 10.3157, lng: 124.6850, name: 'Main Collection Point', type: 'waste_bin' },
    // { lat: 10.3257, lng: 124.6950, name: 'Recycling Center', type: 'recycling' },
    { lat: 10.3057, lng: 124.6750, name: 'Garbage Truck', type: '' }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Waste Collection Map</h1>
      <MapComponent locations={collectionPoints} />
    </div>
  );
};

export default WasteManagementPage;