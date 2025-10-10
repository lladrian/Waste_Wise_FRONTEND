import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/admin_layout';
import ResidentManagementLayout from '../../layouts/managements/resident_management_layout';

const AdminResidentManagementPage = () => {

    return (
        <AdminLayout>
            <ResidentManagementLayout />
        </AdminLayout>
    );
};

export default AdminResidentManagementPage;