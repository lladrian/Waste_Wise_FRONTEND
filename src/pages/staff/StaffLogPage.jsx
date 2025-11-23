import React, { useState, useEffect } from 'react';
import StaffLayout from '../../layouts/staff_layout';
import LogLayout from '../../layouts/login_logs/log_layout';


const StaffLogPage = () => {

    return (
        <StaffLayout>
            <LogLayout />
        </StaffLayout>
    );
};

export default StaffLogPage;