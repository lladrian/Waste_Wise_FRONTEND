import React, { useState, useEffect } from 'react';
import StaffLayout from '../../../layouts/staff_layout';
import BarangayRequestManagementLayout from '../../../layouts/managements/barangay_request_management_layout';


const StaffBarangayRequestManagementPage = () => {

    return (
        <StaffLayout>
            <BarangayRequestManagementLayout />
        </StaffLayout>
    );
};

export default StaffBarangayRequestManagementPage;