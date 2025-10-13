import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/admin_layout';
import RoleActionManagementLayout from '../../../layouts/managements/role_action_management_layout';

const AdminRoleActionManagementPage = () => {

    return (
        <AdminLayout>
            <RoleActionManagementLayout />
        </AdminLayout>
    );
};

export default AdminRoleActionManagementPage;