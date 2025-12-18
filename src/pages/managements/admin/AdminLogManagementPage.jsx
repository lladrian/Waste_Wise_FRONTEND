import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/admin_layout';
import LogManagementLayout from '../../../layouts/managements/log_management_layout';


const AdminLogManagementPage = () => {

    return (
        <AdminLayout>
            <LogManagementLayout />
        </AdminLayout>
    );
};

export default AdminLogManagementPage;