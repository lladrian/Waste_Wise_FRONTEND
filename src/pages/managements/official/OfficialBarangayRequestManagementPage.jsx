import React, { useState, useEffect } from 'react';
import OfficialLayout from '../../../layouts/official_layout';
import BarangayRequestManagementLayout from '../../../layouts/managements/barangay_request_management_layout';


const OfficialBarangayRequestManagementPage = () => {

    return (
        <OfficialLayout>
            <BarangayRequestManagementLayout />
        </OfficialLayout>
    );
};

export default OfficialBarangayRequestManagementPage;