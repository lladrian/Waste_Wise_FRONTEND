import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/admin_layout';
import TruckMapLayout from '../../layouts/truck_maps/truck_map_layout';


const AdminTruckMapPage = () => {

    return (
        <AdminLayout>
            <TruckMapLayout />
        </AdminLayout>
    );
};

export default AdminTruckMapPage;