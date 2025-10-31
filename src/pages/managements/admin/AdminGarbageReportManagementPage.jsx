import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/admin_layout';
import GarbageReportManagementLayout from '../../../layouts/managements/garbage_report_management_layout';


const AdminGarbageReportManagementPage = () => {

    return (
        <AdminLayout>
            <GarbageReportManagementLayout />
        </AdminLayout>
    );
};

export default AdminGarbageReportManagementPage;