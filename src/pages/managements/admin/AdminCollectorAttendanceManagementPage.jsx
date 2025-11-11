import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/admin_layout';
import CollectorAttendanceManagementLayout from '../../../layouts/managements/collector_attendance_management_layout';


const AdminCollectorAttendanceManagementPage = () => {

    return (
        <AdminLayout>
            <CollectorAttendanceManagementLayout />
        </AdminLayout>
    );
};

export default AdminCollectorAttendanceManagementPage;