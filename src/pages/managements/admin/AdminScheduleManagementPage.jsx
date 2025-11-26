import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/admin_layout';
import ScheduleManagementLayout from '../../../layouts/managements/schedule_management_layout';


const AdminScheduleManagementPage = () => {

    return (
        <AdminLayout>
            <ScheduleManagementLayout />
        </AdminLayout>
    );
};

export default AdminScheduleManagementPage;