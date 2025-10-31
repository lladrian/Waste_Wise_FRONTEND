import React, { useState, useEffect } from 'react';
import OfficialLayout from '../../layouts/official_layout';
import NotificationLayout from '../../layouts/notifications/notification_layout';


const OfficialNotificationPage = () => {

    return (
        <OfficialLayout>
            <NotificationLayout />
        </OfficialLayout>
    );
};

export default OfficialNotificationPage;