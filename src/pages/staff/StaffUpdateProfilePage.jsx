import React, { useState, useEffect } from 'react';
import StaffLayout from '../../layouts/staff_layout';
import ProfileLayout from '../../layouts/profiles/profile_layout';


const StaffUpdateProfilePage = () => {

    return (
        <StaffLayout>
            <ProfileLayout />
        </StaffLayout>
    );
};

export default StaffUpdateProfilePage;