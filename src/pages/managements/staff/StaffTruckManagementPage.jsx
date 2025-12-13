import React, { useState, useEffect } from 'react';
import StaffLayout from '../../../layouts/staff_layout';
import TruckManagementLayout from '../../../layouts/managements/truck_management_layout';


const StaffTruckManagementPage = () => {

    return (
        <StaffLayout>
            <TruckManagementLayout />
        </StaffLayout>
    );
};

export default StaffTruckManagementPage;