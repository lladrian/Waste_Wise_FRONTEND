import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/admin_layout';
import DashboardLayout from '../../layouts/dashboards/dashboard_layout';


const AdminDashboardPage = () => {

    return (
        <AdminLayout>
            <DashboardLayout />
        </AdminLayout>
    );
};

export default AdminDashboardPage;