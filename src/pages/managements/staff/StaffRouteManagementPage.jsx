import React, { useState, useEffect } from 'react';
import StaffLayout from '../../../layouts/staff_layout';
import RouteManagementLayout from '../../../layouts/managements/route_management_layout';


const StaffRouteManagementPage = () => {

    return (
        <StaffLayout>
            <RouteManagementLayout />
        </StaffLayout>
    );
};

export default StaffRouteManagementPage;