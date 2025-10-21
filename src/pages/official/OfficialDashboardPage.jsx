import React, { useState, useEffect } from 'react';
import OfficialLayout from '../../layouts/official_layout';
import DashboardLayout from '../../layouts/dashboards/official_dashboard_layout';


const OfficialDashboardPage = () => {

    return (
        <OfficialLayout>
            <DashboardLayout />
        </OfficialLayout>
    );
};

export default OfficialDashboardPage;