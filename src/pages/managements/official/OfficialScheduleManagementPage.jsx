import React, { useState, useEffect } from 'react';
import OfficialLayout from '../../../layouts/official_layout';
import ScheduleManagementLayout from '../../../layouts/managements/schedule_management_layout';


const OfficialScheduleManagementPage = () => {

    return (
        <OfficialLayout>
            <ScheduleManagementLayout />
        </OfficialLayout>
    );
};

export default OfficialScheduleManagementPage;