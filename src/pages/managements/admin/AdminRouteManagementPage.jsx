import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/admin_layout';
import RouteManagementLayout from '../../../layouts/managements/route_management_layout';


const AdminRouteManagementPage = () => {

    return (
        <AdminLayout>
            <RouteManagementLayout />
        </AdminLayout>
    );
};

export default AdminRouteManagementPage;