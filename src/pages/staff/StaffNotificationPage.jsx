import React, { useState, useEffect } from 'react';
import StaffLayout from '../../layouts/staff_layout';
import NotificationLayout from '../../layouts/notifications/notification_layout';


const StaffNotificationPage = () => {

    return (
        <StaffLayout>
            <NotificationLayout />
        </StaffLayout>
    );
};

export default StaffNotificationPage;