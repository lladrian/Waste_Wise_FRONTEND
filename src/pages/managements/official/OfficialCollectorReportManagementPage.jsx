import React, { useState, useEffect } from 'react';
import OfficialLayout from '../../../layouts/admin_layout';
import CollectorReportManagementLayout from '../../../layouts/managements/collector_report_management_layout';


const OfficialCollectorReportManagementPage = () => {

    return (
        <OfficialLayout>
            <CollectorReportManagementLayout />
        </OfficialLayout>
    );
};

export default OfficialCollectorReportManagementPage;