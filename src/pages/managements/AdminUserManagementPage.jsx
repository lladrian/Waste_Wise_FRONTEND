import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/admin_layout';
import UserManagementLayout from '../../layouts/managements/user_management_layout';

const AdminCourseManagementPage = () => {

    return (
        <AdminLayout>
            <UserManagementLayout />
        </AdminLayout>
    );
};

export default AdminCourseManagementPage;