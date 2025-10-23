import React, { useState, useEffect } from 'react';
import OfficialLayout from '../../layouts/official_layout';
import TruckMapLayout from '../../layouts/truck_maps/truck_map_layout';


const OfficialTruckMapPage = () => {

    return (
        <OfficialLayout>
            <TruckMapLayout />
        </OfficialLayout>
    );
};

export default OfficialTruckMapPage;