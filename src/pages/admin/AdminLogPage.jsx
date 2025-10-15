import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/admin_layout';
import LogLayout from '../../layouts/login/log_layout';


const AdminLogPage = () => {

    return (
        <AdminLayout>
            <LogLayout />
        </AdminLayout>
    );
};

export default AdminLogPage;