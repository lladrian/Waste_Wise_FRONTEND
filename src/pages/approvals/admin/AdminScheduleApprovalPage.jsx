import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/admin_layout';
import ScheduleApprovalLayout from '../../../layouts/approvals/schedule_approval_layout';


const AdminScheduleApprovalPage = () => {

    return (
        <AdminLayout>
            <ScheduleApprovalLayout />
        </AdminLayout>
    );
};

export default AdminScheduleApprovalPage;