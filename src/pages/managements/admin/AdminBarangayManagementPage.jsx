import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/admin_layout';
import BarangayManagementLayout from '../../../layouts/managements/barangay_management_layout';


const AdminBarangayManagementPage = () => {

    return (
        <AdminLayout>
            <BarangayManagementLayout />
        </AdminLayout>
    );
};

export default AdminBarangayManagementPage;