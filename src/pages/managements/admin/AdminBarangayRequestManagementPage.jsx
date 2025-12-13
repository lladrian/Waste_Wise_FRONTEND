import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/admin_layout';
import BarangayRequestManagementLayout from '../../../layouts/managements/barangay_request_management_layout';


const AdminBarangayRequestManagementPage = () => {

    return (
        <AdminLayout>
            <BarangayRequestManagementLayout />
        </AdminLayout>
    );
};

export default AdminBarangayRequestManagementPage;