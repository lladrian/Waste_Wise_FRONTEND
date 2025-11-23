import React, { useState, useEffect } from 'react';
import StaffLayout from '../../../layouts/staff_layout';
import GarbageReportManagementLayout from '../../../layouts/managements/garbage_report_management_layout';


const StaffReportGarbageManagementPage = () => {

    return (
        <StaffLayout>
            <GarbageReportManagementLayout />
        </StaffLayout>
    );
};

export default StaffReportGarbageManagementPage;