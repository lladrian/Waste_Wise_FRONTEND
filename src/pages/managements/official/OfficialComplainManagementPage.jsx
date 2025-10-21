import React, { useState, useEffect } from 'react';
import OfficialLayout from '../../../layouts/official_layout';
import ComplainManagementLayout from '../../../layouts/managements/complain_management_layout';


const OfficialComplainManagementPage = () => {

    return (
        <OfficialLayout>
            <ComplainManagementLayout />
        </OfficialLayout>
    );
};

export default OfficialComplainManagementPage;