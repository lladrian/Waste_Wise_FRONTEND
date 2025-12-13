import React, { useState, useEffect } from 'react';
import OfficialLayout from '../../../layouts/official_layout';
import GarbageSiteManagementLayout from '../../../layouts/managements/garbage_site_management_layout';


const OfficialGarbageSiteManagementPage = () => {

    return (
        <OfficialLayout>
            <GarbageSiteManagementLayout />
        </OfficialLayout>
    );
};

export default OfficialGarbageSiteManagementPage;