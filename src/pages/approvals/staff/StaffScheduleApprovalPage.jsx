import React, { useState, useEffect } from 'react';
import StaffLayout from '../../../layouts/staff_layout';
import ScheduleApprovalLayout from '../../../layouts/approvals/schedule_approval_layout';


const StaffScheduleApprovalPage = () => {

    return (
        <StaffLayout>
            <ScheduleApprovalLayout />
        </StaffLayout>
    );
};

export default StaffScheduleApprovalPage;