import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/admin_layout';
import ProfileLayout from '../../layouts/profiles/profile_layout';


const AdminUpdateProfilePage = () => {

    return (
        <AdminLayout>
            <ProfileLayout />
        </AdminLayout>
    );
};

export default AdminUpdateProfilePage;