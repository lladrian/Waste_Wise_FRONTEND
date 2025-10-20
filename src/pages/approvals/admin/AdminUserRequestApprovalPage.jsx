import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/admin_layout';
import UserRequestApprovalLayout from '../../../layouts/approvals/user_request_approval_layout';


const AdminUserRequestApprovalPage = () => {

    return (
        <AdminLayout>
            <UserRequestApprovalLayout />
        </AdminLayout>
    );
};

export default AdminUserRequestApprovalPage;