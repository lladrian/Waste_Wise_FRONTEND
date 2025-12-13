import React, { useState, useEffect } from 'react';
import OfficialLayout from '../../../layouts/official_layout';
import GarbageReportManagementLayout from '../../../layouts/managements/garbage_report_management_layout';


const OfficialReportGarbageManagementPage = () => {

    return (
        <OfficialLayout>
            <GarbageReportManagementLayout />
        </OfficialLayout>
    );
};

export default OfficialReportGarbageManagementPage;