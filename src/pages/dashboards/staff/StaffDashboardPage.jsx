import React, { useState, useEffect } from 'react';
import StaffLayout from '../../../layouts/staff_layout';
import DashboardLayout from '../../../layouts/dashboards/dashboard_layout';


const StaffDashboardPage = () => {

    return (
        <StaffLayout>
            <DashboardLayout />
        </StaffLayout>
    );
};

export default StaffDashboardPage;