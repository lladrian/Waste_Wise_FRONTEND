import React, { useState, useEffect } from 'react';
import StaffLayout from '../../../layouts/staff_layout';
import GarbageSiteManagementLayout from '../../../layouts/managements/garbage_site_management_layout';


const StaffGarbageSiteManagementPage = () => {

    return (
        <StaffLayout>
            <GarbageSiteManagementLayout />
        </StaffLayout>
    );
};

export default StaffGarbageSiteManagementPage;