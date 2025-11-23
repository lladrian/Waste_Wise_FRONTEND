import React, { useState, useEffect } from 'react';
import StaffLayout from '../../../layouts/staff_layout';
import ComplainManagementLayout from '../../../layouts/managements/complain_management_layout';


const StaffComplainManagementPage = () => {

    return (
        <StaffLayout>
            <ComplainManagementLayout />
        </StaffLayout>
    );
};

export default StaffComplainManagementPage;