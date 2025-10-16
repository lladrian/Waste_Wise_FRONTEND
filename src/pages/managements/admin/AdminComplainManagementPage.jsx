import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/admin_layout';
import ComplainManagementLayout from '../../../layouts/managements/complain_management_layout';


const AdminComplainManagementPage = () => {

    return (
        <AdminLayout>
            <ComplainManagementLayout />
        </AdminLayout>
    );
};

export default AdminComplainManagementPage;