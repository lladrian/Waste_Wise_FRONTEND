import React, { useState, useEffect } from 'react';
import StaffLayout from '../../../layouts/staff_layout';
import ScheduleManagementLayout from '../../../layouts/managements/schedule_management_layout';


const StaffScheduleManagementPage = () => {

    return (
        <StaffLayout>
            <ScheduleManagementLayout />
        </StaffLayout>
    );
};

export default StaffScheduleManagementPage;