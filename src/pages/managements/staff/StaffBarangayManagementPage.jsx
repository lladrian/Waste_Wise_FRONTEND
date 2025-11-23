import React, { useState, useEffect } from 'react';
import StaffLayout from '../../../layouts/staff_layout';
import BarangayManagementLayout from '../../../layouts/managements/barangay_management_layout';


const StaffBarangayManagementPage = () => {

    return (
        <StaffLayout>
            <BarangayManagementLayout />
        </StaffLayout>
    );
};

export default StaffBarangayManagementPage;