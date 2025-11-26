import React, { useState, useEffect } from 'react';
import StaffLayout from '../../../layouts/staff_layout';
import CollectorAttendanceManagementLayout from '../../../layouts/managements/collector_attendance_management_layout';


const StaffCollectorAttendanceManagementPage = () => {

    return (
        <StaffLayout>
            <CollectorAttendanceManagementLayout />
        </StaffLayout>
    );
};

export default StaffCollectorAttendanceManagementPage;