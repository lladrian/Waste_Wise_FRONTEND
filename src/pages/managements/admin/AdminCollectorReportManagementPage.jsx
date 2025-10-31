import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/admin_layout';
import CollectorReportManagementLayout from '../../../layouts/managements/collector_report_management_layout';


const AdminCollectorReportManagementPage = () => {

    return (
        <AdminLayout>
            <CollectorReportManagementLayout />
        </AdminLayout>
    );
};

export default AdminCollectorReportManagementPage;