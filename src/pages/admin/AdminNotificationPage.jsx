import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/admin_layout';
import NotificationLayout from '../../layouts/notifications/notification_layout';


const AdminNotificationPage = () => {

    return (
        <AdminLayout>
            <NotificationLayout />
        </AdminLayout>
    );
};

export default AdminNotificationPage;