import React, { useState, useEffect } from 'react';
import StaffLayout from '../../../layouts/admin_layout';
import CollectorReportManagementLayout from '../../../layouts/managements/collector_report_management_layout';


const StaffCollectorReportManagementPage = () => {

    return (
        <StaffLayout>
            <CollectorReportManagementLayout />
        </StaffLayout>
    );
};

export default StaffCollectorReportManagementPage;