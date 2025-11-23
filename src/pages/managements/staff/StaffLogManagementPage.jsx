import React, { useState, useEffect } from 'react';
import StaffLayout from '../../../layouts/staff_layout';
import LogManagementLayout from '../../../layouts/managements/log_management_layout';


const StaffLogManagementPage = () => {

    return (
        <StaffLayout>
            <LogManagementLayout />
        </StaffLayout>
    );
};

export default StaffLogManagementPage;