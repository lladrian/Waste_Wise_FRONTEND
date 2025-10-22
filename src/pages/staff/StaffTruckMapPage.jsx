import React, { useState, useEffect } from 'react';
import StaffLayout from '../../layouts/staff_layout';
import TruckMapLayout from '../../layouts/truck_maps/truck_map_layout';


const StaffTruckMapPage = () => {

    return (
        <StaffLayout>
            <TruckMapLayout />
        </StaffLayout>
    );
};

export default StaffTruckMapPage;