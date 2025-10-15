import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/staff_layout';
import TruckManagementLayout from '../../../layouts/managements/truck_management_layout';


const AdminTruckManagementPage = () => {

    return (
        <AdminLayout>
            <TruckManagementLayout />
        </AdminLayout>
    );
};

export default AdminTruckManagementPage;