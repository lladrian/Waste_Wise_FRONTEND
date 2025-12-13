import React, { useState, useEffect } from 'react';
import OfficialLayout from '../../../layouts/official_layout';
import ResidentManagementLayout from '../../../layouts/managements/resident_management_layout';

const OfficialResidentManagementPage = () => {

    return (
        <OfficialLayout>
            <ResidentManagementLayout />
        </OfficialLayout>
    );
};

export default OfficialResidentManagementPage;