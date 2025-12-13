import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/admin_layout';
import GarbageSiteManagementLayout from '../../../layouts/managements/garbage_site_management_layout';


const AdminGarbageSiteManagementPage = () => {

    return (
        <AdminLayout>
            <GarbageSiteManagementLayout />
        </AdminLayout>
    );
};

export default AdminGarbageSiteManagementPage;