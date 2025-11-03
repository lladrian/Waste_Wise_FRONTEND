import React, { useState, useEffect, useContext } from 'react';
import OfficialLayout from '../../layouts/official_layout';
import MapLocationMarkerMultiple from '../../components/MapLocationMarkerMultiple';

import { getAllGarbageSiteSpecifcBarangay } from "../../hooks/barangay_hook";

import { AuthContext } from '../../context/AuthContext';

const OfficialGarbageSitePage = () => {
    const { user } = useContext(AuthContext);
    const [garbageSitePositions, setGarbageSitePositions] = useState([]);
    const [garbageSites, setGarbageSites] = useState([]);


    useEffect(() => {
        fetchDataGarbageSites(user?.barangay?._id);
    }, []);

    const fetchDataGarbageSites = async (barangay_id) => {
        try {
            const { data, success } = await getAllGarbageSiteSpecifcBarangay(barangay_id);
            if (success === true) {
                const locations = data.data.map(site => ({
                    lat: site.position.lat,
                    lng: site.position.lng
                }));

                setGarbageSites(data.data)
                setGarbageSitePositions(locations);
            }
        } catch (err) {
            console.error("Error fetching reg data:", err);
            toast.error("Failed to load registration data");
        }
    };


    return (
        <OfficialLayout>
            <div className="flex justify-between items-center py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Total Garbage Sites: ({garbageSites.length})</h2>
            </div>
            <div className="w-full h-[700px]">
                <MapLocationMarkerMultiple locations={garbageSitePositions} height={"600px"} />
            </div>
        </OfficialLayout >
    );
};

export default OfficialGarbageSitePage;